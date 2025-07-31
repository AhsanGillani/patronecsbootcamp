-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'instructor', 'student');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role app_role NOT NULL DEFAULT 'student',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create courses table
CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  instructor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES public.categories(id),
  level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  status TEXT NOT NULL CHECK (status IN ('draft', 'pending', 'approved', 'rejected')) DEFAULT 'draft',
  admin_comments TEXT,
  price DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create blogs table
CREATE TABLE public.blogs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  status TEXT NOT NULL CHECK (status IN ('draft', 'pending', 'approved', 'rejected')) DEFAULT 'draft',
  admin_comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create enrollments table
CREATE TABLE public.enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, course_id)
);

-- Create announcements table
CREATE TABLE public.announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  target_role app_role,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cms_content table
CREATE TABLE public.cms_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section TEXT NOT NULL UNIQUE,
  content JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES public.profiles(id)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_content ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS app_role AS $$
  SELECT role FROM public.profiles WHERE user_id = user_uuid;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'User'),
    COALESCE((NEW.raw_user_meta_data ->> 'role')::app_role, 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blogs_updated_at
  BEFORE UPDATE ON public.blogs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can delete profiles" ON public.profiles
  FOR DELETE USING (public.get_user_role(auth.uid()) = 'admin');

-- RLS Policies for categories
CREATE POLICY "Anyone can view categories" ON public.categories
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage categories" ON public.categories
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- RLS Policies for courses
CREATE POLICY "Anyone can view approved courses" ON public.courses
  FOR SELECT USING (status = 'approved' OR public.get_user_role(auth.uid()) = 'admin' OR instructor_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Instructors can manage own courses" ON public.courses
  FOR ALL USING (instructor_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can manage all courses" ON public.courses
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- RLS Policies for blogs
CREATE POLICY "Anyone can view approved blogs" ON public.blogs
  FOR SELECT USING (status = 'approved' OR public.get_user_role(auth.uid()) = 'admin' OR author_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Instructors can manage own blogs" ON public.blogs
  FOR ALL USING (author_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can manage all blogs" ON public.blogs
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- RLS Policies for enrollments
CREATE POLICY "Students can view own enrollments" ON public.enrollments
  FOR SELECT USING (student_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Students can enroll themselves" ON public.enrollments
  FOR INSERT WITH CHECK (student_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all enrollments" ON public.enrollments
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- RLS Policies for announcements
CREATE POLICY "Users can view relevant announcements" ON public.announcements
  FOR SELECT USING (target_role IS NULL OR target_role = public.get_user_role(auth.uid()) OR public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can manage announcements" ON public.announcements
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- RLS Policies for cms_content
CREATE POLICY "Anyone can view cms content" ON public.cms_content
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage cms content" ON public.cms_content
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- Insert default categories
INSERT INTO public.categories (name, description) VALUES
  ('Programming', 'Software development and programming languages'),
  ('Design', 'UI/UX design, graphic design, and creative arts'),
  ('Business', 'Entrepreneurship, marketing, and business skills'),
  ('Data Science', 'Analytics, machine learning, and data visualization'),
  ('Personal Development', 'Soft skills and personal growth');

-- Insert default CMS content
INSERT INTO public.cms_content (section, content) VALUES
  ('hero', '{"title": "Learn Without Limits", "subtitle": "Discover thousands of courses from expert instructors", "cta": "Start Learning Today"}'),
  ('features', '{"title": "Why Choose Our Platform", "items": [{"title": "Expert Instructors", "description": "Learn from industry professionals"}, {"title": "Flexible Learning", "description": "Study at your own pace"}, {"title": "Certificates", "description": "Earn recognized certifications"}]}'),
  ('footer', '{"company": "EduPlatform", "description": "Empowering learners worldwide", "links": {"about": "/about", "contact": "/contact", "privacy": "/privacy"}}');