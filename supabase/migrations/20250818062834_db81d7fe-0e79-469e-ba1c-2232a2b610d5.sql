-- Fix course and blog visibility issues
-- Allow public viewing of approved courses and blogs

-- Update courses RLS policy for public viewing of approved courses
DROP POLICY IF EXISTS "Everyone can view approved courses" ON public.courses;

CREATE POLICY "Public can view approved courses"
ON public.courses
FOR SELECT
USING (status = 'approved'::course_status AND soft_deleted = false);

CREATE POLICY "Authors and admins can view all their courses"
ON public.courses
FOR SELECT
USING (instructor_id = auth.uid() OR is_admin());

-- Update blogs RLS policy for public viewing of approved blogs  
DROP POLICY IF EXISTS "Everyone can view approved blogs" ON public.blogs;

CREATE POLICY "Public can view approved blogs"
ON public.blogs
FOR SELECT
USING (status = 'approved'::blog_status AND is_published = true);

CREATE POLICY "Authors and admins can view all their blogs"
ON public.blogs
FOR SELECT
USING (author_id = auth.uid() OR is_admin());

-- Ensure categories are publicly viewable (needed for course/blog display)
DROP POLICY IF EXISTS "Everyone can view categories" ON public.categories;

CREATE POLICY "Public can view categories"
ON public.categories
FOR SELECT
USING (true);

-- Fix profiles RLS to allow viewing instructor profiles for course display
DROP POLICY IF EXISTS "Public instructor profiles for course display" ON public.profiles;

CREATE POLICY "Public can view instructor profiles"
ON public.profiles
FOR SELECT
USING (role = 'instructor'::user_role);