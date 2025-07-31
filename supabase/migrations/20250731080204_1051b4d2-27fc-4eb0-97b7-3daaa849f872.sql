-- Fix security issues by setting proper search_path on functions
CREATE OR REPLACE FUNCTION public.update_course_lesson_stats()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update lesson count and total duration for the course
  UPDATE public.courses SET
    lesson_count = (
      SELECT COUNT(*) FROM public.lessons 
      WHERE course_id = COALESCE(NEW.course_id, OLD.course_id)
      AND is_published = true
    ),
    total_duration = (
      SELECT COALESCE(SUM(duration), 0) FROM public.lessons 
      WHERE course_id = COALESCE(NEW.course_id, OLD.course_id)
      AND is_published = true
    )
  WHERE id = COALESCE(NEW.course_id, OLD.course_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Fix existing functions with proper search_path
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$;

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

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;