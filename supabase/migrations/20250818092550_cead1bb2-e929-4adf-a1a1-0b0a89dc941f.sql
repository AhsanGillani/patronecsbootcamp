-- Fix remaining trigger functions and update for security compliance

CREATE OR REPLACE FUNCTION public.set_course_slug()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
      NEW.slug := public.generate_course_slug(NEW.title);
    ELSE
      NEW.slug := public.slugify(NEW.slug);
      IF EXISTS (SELECT 1 FROM public.courses WHERE slug = NEW.slug) THEN
        NEW.slug := public.generate_course_slug(NEW.slug);
      END IF;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.title IS DISTINCT FROM OLD.title AND (NEW.slug IS NULL OR NEW.slug = OLD.slug) THEN
      NEW.slug := public.generate_course_slug(NEW.title);
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_blog_slug()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
      NEW.slug := public.generate_blog_slug(NEW.title);
    ELSE
      NEW.slug := public.slugify(NEW.slug);
      IF EXISTS (SELECT 1 FROM public.blogs WHERE slug = NEW.slug) THEN
        NEW.slug := public.generate_blog_slug(NEW.slug);
      END IF;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.title IS DISTINCT FROM OLD.title AND (NEW.slug IS NULL OR NEW.slug = OLD.slug) THEN
      NEW.slug := public.generate_blog_slug(NEW.title);
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_category_slug()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
      NEW.slug := public.generate_category_slug(NEW.name);
    ELSE
      NEW.slug := public.slugify(NEW.slug);
      IF EXISTS (SELECT 1 FROM public.categories WHERE slug = NEW.slug) THEN
        NEW.slug := public.generate_category_slug(NEW.slug);
      END IF;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.name IS DISTINCT FROM OLD.name AND (NEW.slug IS NULL OR NEW.slug = OLD.slug) THEN
      NEW.slug := public.generate_category_slug(NEW.name);
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_attempt_status_from_quiz()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  has_qa boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.quiz_questions qq WHERE qq.quiz_id = NEW.quiz_id AND (qq.type = 'qa' OR (qq.expected_answer IS NOT NULL))
  ) INTO has_qa;

  IF has_qa THEN
    NEW.status := 'pending_review';
  ELSE
    NEW.status := 'auto_graded';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_quiz_attempt_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  prev_count integer;
BEGIN
  SELECT COUNT(*) INTO prev_count FROM public.quiz_attempts
  WHERE student_id = NEW.student_id AND quiz_id = NEW.quiz_id;
  NEW.attempt_number := GREATEST(prev_count, 0) + 1;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_enrollment_progress()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update the enrollment progress
  UPDATE public.enrollments
  SET progress = public.calculate_course_progress(NEW.student_id, 
    (SELECT course_id FROM public.lessons WHERE id = NEW.lesson_id))
  WHERE student_id = NEW.student_id 
    AND course_id = (SELECT course_id FROM public.lessons WHERE id = NEW.lesson_id);
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert with all required columns and properly qualified enum types
  INSERT INTO public.profiles (
    user_id, 
    email, 
    full_name, 
    role, 
    status,
    bio,
    avatar_url
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data ->> 'role')::public.user_role, 'student'::public.user_role),
    'active'::public.account_status,
    NULL,
    NULL
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RAISE;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_course_lesson_stats()
RETURNS trigger
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