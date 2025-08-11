-- Add video progress tracking to lesson_progress table
ALTER TABLE public.lesson_progress 
ADD COLUMN IF NOT EXISTS video_watch_progress DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS video_watched_seconds INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS pdf_viewed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS text_read BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS quiz_passed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create index for better performance on progress queries
CREATE INDEX IF NOT EXISTS idx_lesson_progress_student_course 
ON public.lesson_progress(student_id, lesson_id);

-- Function to calculate lesson completion percentage
CREATE OR REPLACE FUNCTION public.calculate_lesson_completion(
  p_student_id UUID,
  p_lesson_id UUID
) RETURNS DECIMAL(5,2) AS $$
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
  SELECT l.type, lp.video_watch_progress, lp.pdf_viewed, lp.text_read, lp.quiz_passed
  INTO lesson_type, video_progress, pdf_viewed, text_read, quiz_passed
  FROM public.lessons l
  LEFT JOIN public.lesson_progress lp ON l.id = lp.lesson_id AND lp.student_id = p_student_id
  WHERE l.id = p_lesson_id;

  IF lesson_type IS NULL THEN
    RETURN 0;
  END IF;

  -- Count total components for this lesson type
  CASE lesson_type
    WHEN 'video' THEN
      total_components := 1;
      IF video_progress >= 90 THEN
        completed_components := 1;
      END IF;
    WHEN 'pdf' THEN
      total_components := 1;
      IF pdf_viewed THEN
        completed_components := 1;
      END IF;
    WHEN 'text' THEN
      total_components := 1;
      IF text_read THEN
        completed_components := 1;
      END IF;
    WHEN 'quiz' THEN
      total_components := 1;
      IF quiz_passed THEN
        completed_components := 1;
      END IF;
    ELSE
      -- Mixed content lesson
      total_components := 0;
      IF video_progress > 0 THEN total_components := total_components + 1; END IF;
      IF EXISTS (SELECT 1 FROM public.lessons WHERE id = p_lesson_id AND pdf_url IS NOT NULL) THEN 
        total_components := total_components + 1; 
      END IF;
      IF EXISTS (SELECT 1 FROM public.lessons WHERE id = p_lesson_id AND content IS NOT NULL AND content != '') THEN 
        total_components := total_components + 1; 
      END IF;
      IF EXISTS (SELECT 1 FROM public.quizzes WHERE lesson_id = p_lesson_id) THEN 
        total_components := total_components + 1; 
      END IF;
      
      -- Count completed components
      IF video_progress >= 90 THEN completed_components := completed_components + 1; END IF;
      IF pdf_viewed THEN completed_components := completed_components + 1; END IF;
      IF text_read THEN completed_components := completed_components + 1; END IF;
      IF quiz_passed THEN completed_components := completed_components + 1; END IF;
  END CASE;

  IF total_components = 0 THEN
    RETURN 0;
  END IF;

  RETURN ROUND((completed_components::decimal / total_components) * 100, 2);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate course progress
CREATE OR REPLACE FUNCTION public.calculate_course_progress(
  p_student_id UUID,
  p_course_id UUID
) RETURNS DECIMAL(5,2) AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if lesson is unlocked
CREATE OR REPLACE FUNCTION public.is_lesson_unlocked(
  p_student_id UUID,
  p_lesson_id UUID
) RETURNS BOOLEAN AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update enrollment progress when lesson progress changes
CREATE OR REPLACE FUNCTION public.update_enrollment_progress()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the enrollment progress
  UPDATE public.enrollments
  SET progress = public.calculate_course_progress(NEW.student_id, 
    (SELECT course_id FROM public.lessons WHERE id = NEW.lesson_id))
  WHERE student_id = NEW.student_id 
    AND course_id = (SELECT course_id FROM public.lessons WHERE id = NEW.lesson_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for lesson progress updates
DROP TRIGGER IF EXISTS trg_update_enrollment_progress ON public.lesson_progress;
CREATE TRIGGER trg_update_enrollment_progress
  AFTER INSERT OR UPDATE ON public.lesson_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_enrollment_progress();

-- Update existing lesson_progress records to have default values
UPDATE public.lesson_progress 
SET 
  video_watch_progress = COALESCE(video_watch_progress, 0),
  video_watched_seconds = COALESCE(video_watched_seconds, 0),
  pdf_viewed = COALESCE(pdf_viewed, false),
  text_read = COALESCE(text_read, false),
  quiz_passed = COALESCE(quiz_passed, false),
  last_accessed_at = COALESCE(last_accessed_at, created_at)
WHERE 
  video_watch_progress IS NULL 
  OR video_watched_seconds IS NULL 
  OR pdf_viewed IS NULL 
  OR text_read IS NULL 
  OR quiz_passed IS NULL 
  OR last_accessed_at IS NULL;
