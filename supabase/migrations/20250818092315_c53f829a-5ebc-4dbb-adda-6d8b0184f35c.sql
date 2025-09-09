-- Fix security linter issues identified after the previous migration

-- 1. Fix the security definer view issue by removing the view and using a more secure approach
DROP VIEW IF EXISTS public.instructor_public_profiles;

-- 2. Create a security definer function instead of a view for public instructor profiles
CREATE OR REPLACE FUNCTION public.get_public_instructor_profiles()
RETURNS TABLE (
  user_id uuid,
  full_name text,
  bio text,
  avatar_url text,
  location text,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    profiles.user_id,
    profiles.full_name,
    profiles.bio,
    profiles.avatar_url,
    profiles.location,
    profiles.created_at
  FROM public.profiles 
  WHERE profiles.role = 'instructor'::user_role 
    AND profiles.status = 'active'::account_status;
$$;

-- 3. Grant execution permissions on the function
GRANT EXECUTE ON FUNCTION public.get_public_instructor_profiles() TO anon;
GRANT EXECUTE ON FUNCTION public.get_public_instructor_profiles() TO authenticated;

-- 4. Update the get_user_role function to have proper search_path
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(role, 'student'::user_role) FROM public.profiles WHERE user_id = auth.uid();
$$;

-- 5. Update the is_admin function to have proper search_path  
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;