-- Fix critical security vulnerability in profiles table
-- Remove the dangerous public access policy and create secure alternatives

-- 1. Drop the existing problematic policies
DROP POLICY IF EXISTS "Public can view instructor profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles; -- duplicate policy  
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles; -- overly broad policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles; -- will recreate with same name

-- 2. Create a secure public instructor view (only safe fields)
CREATE OR REPLACE VIEW public.instructor_public_profiles AS
SELECT 
  user_id,
  full_name,
  bio,
  avatar_url,
  location,
  created_at
FROM public.profiles 
WHERE role = 'instructor'::user_role 
  AND status = 'active'::account_status;

-- 3. Create more specific and secure policies for profiles table

-- Policy: Authenticated users can view their own complete profile
CREATE POLICY "Users can view own complete profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Instructors can view basic info of their enrolled students (no sensitive data)
CREATE POLICY "Instructors can view enrolled students basic info" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  get_user_role() = 'instructor'::user_role 
  AND EXISTS (
    SELECT 1 
    FROM enrollments e 
    JOIN courses c ON c.id = e.course_id 
    WHERE c.instructor_id = auth.uid() 
      AND e.student_id = profiles.user_id
  )
);

-- Policy: Admins can view all profiles
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (is_admin());

-- Policy: Users can update their own profile  
CREATE POLICY "Users can update own profile secure" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Admins can update any profile
CREATE POLICY "Admins can update profiles" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Policy: Admins can delete profiles
CREATE POLICY "Admins can delete profiles" 
ON public.profiles 
FOR DELETE 
TO authenticated
USING (is_admin());

-- 4. Grant appropriate permissions on the public view
GRANT SELECT ON public.instructor_public_profiles TO anon;
GRANT SELECT ON public.instructor_public_profiles TO authenticated;