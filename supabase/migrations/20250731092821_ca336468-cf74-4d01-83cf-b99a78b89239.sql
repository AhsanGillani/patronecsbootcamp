-- Fix existing announcements to be published
UPDATE announcements 
SET is_published = true 
WHERE is_published = false;

-- Check if the get_user_role function exists and fix it if needed
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$;