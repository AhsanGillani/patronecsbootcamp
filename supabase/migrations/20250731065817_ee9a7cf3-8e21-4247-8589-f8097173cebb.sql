-- Create enum types
CREATE TYPE public.user_role AS ENUM ('admin', 'instructor', 'student');
CREATE TYPE public.account_status AS ENUM ('active', 'inactive', 'suspended');
CREATE TYPE public.course_status AS ENUM ('draft', 'pending', 'approved', 'rejected');
CREATE TYPE public.blog_status AS ENUM ('draft', 'pending', 'approved', 'rejected');
CREATE TYPE public.course_level AS ENUM ('beginner', 'intermediate', 'advanced');

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  status account_status NOT NULL DEFAULT 'active',
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create courses table
CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  instructor_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  level course_level NOT NULL DEFAULT 'beginner',
  category_id UUID REFERENCES public.categories(id),
  status course_status NOT NULL DEFAULT 'draft',
  admin_comments TEXT,
  total_enrollments INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create blogs table
CREATE TABLE public.blogs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image_url TEXT,
  category_id UUID REFERENCES public.categories(id),
  status blog_status NOT NULL DEFAULT 'draft',
  admin_comments TEXT,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create enrollments table
CREATE TABLE public.enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  progress DECIMAL(5,2) DEFAULT 0,
  UNIQUE(student_id, course_id)
);

-- Create announcements table
CREATE TABLE public.announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  target_role user_role,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create CMS content table
CREATE TABLE public.cms_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section TEXT NOT NULL UNIQUE,
  content JSONB NOT NULL,
  updated_by UUID REFERENCES public.profiles(user_id),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_content ENABLE ROW LEVEL SECURITY;

-- Create security definer function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create security definer function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Admins can delete profiles" ON public.profiles
  FOR DELETE USING (public.is_admin());

-- RLS Policies for categories
CREATE POLICY "Everyone can view categories" ON public.categories
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage categories" ON public.categories
  FOR ALL USING (public.is_admin());

-- RLS Policies for courses
CREATE POLICY "Everyone can view approved courses" ON public.courses
  FOR SELECT USING (status = 'approved' OR instructor_id = auth.uid() OR public.is_admin());

CREATE POLICY "Instructors can create courses" ON public.courses
  FOR INSERT WITH CHECK (instructor_id = auth.uid() AND public.get_user_role() IN ('instructor', 'admin'));

CREATE POLICY "Instructors can update their courses" ON public.courses
  FOR UPDATE USING (instructor_id = auth.uid() OR public.is_admin());

CREATE POLICY "Admins can delete courses" ON public.courses
  FOR DELETE USING (public.is_admin());

-- RLS Policies for blogs
CREATE POLICY "Everyone can view approved blogs" ON public.blogs
  FOR SELECT USING (status = 'approved' OR author_id = auth.uid() OR public.is_admin());

CREATE POLICY "Instructors and admins can create blogs" ON public.blogs
  FOR INSERT WITH CHECK (author_id = auth.uid() AND public.get_user_role() IN ('instructor', 'admin'));

CREATE POLICY "Authors and admins can update blogs" ON public.blogs
  FOR UPDATE USING (author_id = auth.uid() OR public.is_admin());

CREATE POLICY "Admins can delete blogs" ON public.blogs
  FOR DELETE USING (public.is_admin());

-- RLS Policies for enrollments
CREATE POLICY "Students can view their enrollments" ON public.enrollments
  FOR SELECT USING (student_id = auth.uid() OR public.is_admin());

CREATE POLICY "Students can enroll in courses" ON public.enrollments
  FOR INSERT WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can update their enrollment progress" ON public.enrollments
  FOR UPDATE USING (student_id = auth.uid() OR public.is_admin());

-- RLS Policies for announcements
CREATE POLICY "Users can view published announcements" ON public.announcements
  FOR SELECT USING (is_published = true AND (target_role IS NULL OR target_role = public.get_user_role()) OR public.is_admin());

CREATE POLICY "Admins can manage announcements" ON public.announcements
  FOR ALL USING (public.is_admin());

-- RLS Policies for CMS content
CREATE POLICY "Everyone can view CMS content" ON public.cms_content
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage CMS content" ON public.cms_content
  FOR ALL USING (public.is_admin());

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blogs_updated_at
  BEFORE UPDATE ON public.blogs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert some initial data
INSERT INTO public.categories (name, description, icon) VALUES
  ('Programming', 'Learn programming languages and software development', 'Code'),
  ('Design', 'Graphic design, UI/UX, and visual arts', 'Palette'),
  ('Business', 'Marketing, entrepreneurship, and business skills', 'Briefcase'),
  ('Data Science', 'Data analysis, machine learning, and statistics', 'BarChart'),
  ('Photography', 'Digital photography and photo editing', 'Camera');

-- Insert initial CMS content
INSERT INTO public.cms_content (section, content) VALUES
  ('hero', '{"title": "Learn Without Limits", "subtitle": "Discover thousands of courses from expert instructors", "buttonText": "Get Started"}'),
  ('features', '{"title": "Why Choose PatronEcs?", "items": [{"title": "Expert Instructors", "description": "Learn from industry professionals"}, {"title": "Flexible Learning", "description": "Study at your own pace"}, {"title": "Certificate", "description": "Get certified upon completion"}]}'),
  ('footer', '{"companyName": "PatronEcs", "description": "Your premier destination for online learning", "socialLinks": {"facebook": "#", "twitter": "#", "linkedin": "#"}}');