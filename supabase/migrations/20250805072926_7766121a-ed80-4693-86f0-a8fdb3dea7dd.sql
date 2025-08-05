-- Add updated_at column to enrollments table
ALTER TABLE public.enrollments 
ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create trigger to update updated_at column
CREATE TRIGGER update_enrollments_updated_at
  BEFORE UPDATE ON public.enrollments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to calculate and update enrollment progress
CREATE OR REPLACE FUNCTION public.update_enrollment_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  total_lessons INTEGER;
  completed_lessons INTEGER;
  progress_percentage NUMERIC;
  enrollment_record RECORD;
BEGIN
  -- Get the course_id from the lesson
  SELECT course_id INTO enrollment_record
  FROM lessons 
  WHERE id = COALESCE(NEW.lesson_id, OLD.lesson_id);
  
  -- Calculate total lessons for the course
  SELECT COUNT(*) INTO total_lessons
  FROM lessons
  WHERE course_id = enrollment_record.course_id
  AND is_published = true;
  
  -- Calculate completed lessons for this student
  SELECT COUNT(*) INTO completed_lessons
  FROM lesson_progress lp
  JOIN lessons l ON l.id = lp.lesson_id
  WHERE l.course_id = enrollment_record.course_id
  AND lp.student_id = COALESCE(NEW.student_id, OLD.student_id)
  AND lp.is_completed = true;
  
  -- Calculate progress percentage
  IF total_lessons > 0 THEN
    progress_percentage := (completed_lessons::NUMERIC / total_lessons::NUMERIC) * 100;
  ELSE
    progress_percentage := 0;
  END IF;
  
  -- Update enrollment progress
  UPDATE enrollments 
  SET 
    progress = progress_percentage,
    completed_at = CASE 
      WHEN progress_percentage >= 100 THEN now() 
      ELSE NULL 
    END,
    updated_at = now()
  WHERE student_id = COALESCE(NEW.student_id, OLD.student_id)
  AND course_id = enrollment_record.course_id;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger to update enrollment progress when lesson progress changes
CREATE TRIGGER sync_enrollment_progress
  AFTER INSERT OR UPDATE OR DELETE ON public.lesson_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_enrollment_progress();