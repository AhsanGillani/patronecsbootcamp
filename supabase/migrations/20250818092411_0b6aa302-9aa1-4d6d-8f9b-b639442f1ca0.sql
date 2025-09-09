-- Fix remaining function search path issues for security compliance

-- Update all functions to have proper search_path set to prevent potential security issues

CREATE OR REPLACE FUNCTION public.slugify(txt text)
RETURNS text
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN txt IS NULL THEN NULL
    ELSE trim(both '-' FROM regexp_replace(lower(txt), '[^a-z0-9]+', '-', 'g'))
  END
$$;

CREATE OR REPLACE FUNCTION public.generate_course_slug(title text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base text := COALESCE(public.slugify(title), 'course');
  candidate text := base;
  i int := 1;
BEGIN
  WHILE EXISTS (SELECT 1 FROM public.courses WHERE slug = candidate) LOOP
    i := i + 1;
    candidate := base || '-' || i::text;
  END LOOP;
  RETURN candidate;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_blog_slug(title text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base text := COALESCE(public.slugify(title), 'blog');
  candidate text := base;
  i int := 1;
BEGIN
  WHILE EXISTS (SELECT 1 FROM public.blogs WHERE slug = candidate) LOOP
    i := i + 1;
    candidate := base || '-' || i::text;
  END LOOP;
  RETURN candidate;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_category_slug(name text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base text := COALESCE(public.slugify(name), 'category');
  candidate text := base;
  i int := 1;
BEGIN
  WHILE EXISTS (SELECT 1 FROM public.categories WHERE slug = candidate) LOOP
    i := i + 1;
    candidate := base || '-' || i::text;
  END LOOP;
  RETURN candidate;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_certificate_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN 'CERT-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(FLOOR(RANDOM() * 999999)::TEXT, 6, '0');
END;
$$;

CREATE OR REPLACE FUNCTION public.calculate_lesson_completion(p_student_id uuid, p_lesson_id uuid)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.calculate_course_progress(p_student_id uuid, p_course_id uuid)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.is_lesson_unlocked(p_student_id uuid, p_lesson_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;