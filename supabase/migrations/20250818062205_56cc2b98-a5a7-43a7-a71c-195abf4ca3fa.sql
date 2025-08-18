-- Fix the critical security vulnerability: restrict profiles table access
-- Currently the profiles table is publicly readable which exposes user data

-- Drop existing policies that are too permissive
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create secure policies for profiles table
CREATE POLICY "Users can view own profile only" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (is_admin());

CREATE POLICY "Instructors can view students for their courses" 
ON public.profiles 
FOR SELECT 
USING (
  -- Allow instructors to see students enrolled in their courses
  (get_user_role() = 'instructor' AND EXISTS (
    SELECT 1 FROM enrollments e
    JOIN courses c ON c.id = e.course_id
    WHERE c.instructor_id = auth.uid() 
    AND e.student_id = profiles.user_id
  )) OR
  -- Allow viewing instructors profiles for course display
  (role = 'instructor')
);

-- Ensure instructors can still see basic profile info for course management
CREATE POLICY "Public instructor profiles for course display" 
ON public.profiles 
FOR SELECT 
USING (role = 'instructor');

-- Fix function search_path issues
CREATE OR REPLACE FUNCTION public.calculate_lesson_completion(p_student_id uuid, p_lesson_id uuid)
 RETURNS numeric
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  lesson_type text;
  video_progress decimal(5,2) := 0;
  pdf_viewed boolean := false;
  text_read boolean := false;
  quiz_passed boolean := false;
  total_components integer := 0;
  completed_components integer := 0;
BEGIN
  -- Get lesson type and current progress
  SELECT l.type INTO lesson_type
  FROM public.lessons l
  WHERE l.id = p_lesson_id;
  
  -- Get current progress data
  SELECT 
    COALESCE(lp.video_watch_progress, 0),
    COALESCE(lp.pdf_viewed, false),
    COALESCE(lp.text_read, false),
    COALESCE(lp.quiz_passed, false)
  INTO video_progress, pdf_viewed, text_read, quiz_passed
  FROM public.lesson_progress lp
  WHERE lp.student_id = p_student_id AND lp.lesson_id = p_lesson_id;
  
  -- Count components based on lesson type
  IF lesson_type = 'video' OR EXISTS (SELECT 1 FROM public.lessons WHERE id = p_lesson_id AND video_url IS NOT NULL) THEN
    total_components := total_components + 1;
    IF video_progress >= 90 THEN
      completed_components := completed_components + 1;
    END IF;
  END IF;
  
  IF lesson_type = 'pdf' OR EXISTS (SELECT 1 FROM public.lessons WHERE id = p_lesson_id AND pdf_url IS NOT NULL) THEN
    total_components := total_components + 1;
    IF pdf_viewed THEN
      completed_components := completed_components + 1;
    END IF;
  END IF;
  
  IF lesson_type = 'text' OR EXISTS (SELECT 1 FROM public.lessons WHERE id = p_lesson_id AND content IS NOT NULL) THEN
    total_components := total_components + 1;
    IF text_read THEN
      completed_components := completed_components + 1;
    END IF;
  END IF;
  
  -- Check for quizzes
  IF EXISTS (SELECT 1 FROM public.quizzes WHERE lesson_id = p_lesson_id) THEN
    total_components := total_components + 1;
    IF quiz_passed THEN
      completed_components := completed_components + 1;
    END IF;
  END IF;
  
  -- Return completion percentage
  IF total_components = 0 THEN
    RETURN 0;
  ELSE
    RETURN ROUND((completed_components::decimal / total_components) * 100, 2);
  END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION public.calculate_course_progress(p_student_id uuid, p_course_id uuid)
 RETURNS numeric
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  total_lessons integer;
  completed_lessons integer;
BEGIN
  -- Count total lessons in course
  SELECT COUNT(*) INTO total_lessons
  FROM public.lessons
  WHERE course_id = p_course_id AND is_published = true;

  IF total_lessons = 0 THEN
    RETURN 0;
  END IF;

  -- Count completed lessons
  SELECT COUNT(*) INTO completed_lessons
  FROM public.lessons l
  JOIN public.lesson_progress lp ON l.id = lp.lesson_id
  WHERE l.course_id = p_course_id 
    AND l.is_published = true
    AND lp.student_id = p_student_id
    AND public.calculate_lesson_completion(p_student_id, l.id) = 100;

  RETURN ROUND((completed_lessons::decimal / total_lessons) * 100, 2);
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_lesson_unlocked(p_student_id uuid, p_lesson_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  lesson_order integer;
  course_id uuid;
  previous_lesson_id uuid;
  previous_completion decimal(5,2);
BEGIN
  -- Get lesson order and course
  SELECT l.order_index, l.course_id INTO lesson_order, course_id
  FROM public.lessons l
  WHERE l.id = p_lesson_id;

  -- First lesson is always unlocked
  IF lesson_order = 1 THEN
    RETURN true;
  END IF;

  -- Check if previous lesson is completed
  SELECT l.id INTO previous_lesson_id
  FROM public.lessons l
  WHERE l.course_id = course_id AND l.order_index = lesson_order - 1
  LIMIT 1;

  IF previous_lesson_id IS NULL THEN
    RETURN true;
  END IF;

  -- Check previous lesson completion
  SELECT public.calculate_lesson_completion(p_student_id, previous_lesson_id) INTO previous_completion;

  RETURN previous_completion = 100;
END;
$function$;