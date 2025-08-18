-- 1) Create enum for attempt status
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'attempt_status') THEN
    CREATE TYPE public.attempt_status AS ENUM ('auto_graded','pending_review','reviewed');
  END IF;
END $$;

-- 2) Add columns to quiz_attempts for review workflow
ALTER TABLE public.quiz_attempts
  ADD COLUMN IF NOT EXISTS status public.attempt_status NOT NULL DEFAULT 'auto_graded',
  ADD COLUMN IF NOT EXISTS reviewed_by uuid NULL,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS feedback text NULL,
  ADD COLUMN IF NOT EXISTS attempt_number integer NOT NULL DEFAULT 1;

-- 3) Create answers table to store per-question answers
CREATE TABLE IF NOT EXISTS public.quiz_attempt_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_attempt_id uuid NOT NULL REFERENCES public.quiz_attempts(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  selected_index integer NULL,
  answer_text text NULL,
  is_correct boolean NULL,
  requires_review boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quiz_attempt_answers ENABLE ROW LEVEL SECURITY;

-- 4) RLS policies for quiz_attempt_answers
DO $$ BEGIN
  -- Students can insert their own answers
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='quiz_attempt_answers' AND policyname='Students insert their own attempt answers'
  ) THEN
    CREATE POLICY "Students insert their own attempt answers"
    ON public.quiz_attempt_answers
    FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.quiz_attempts a
        WHERE a.id = quiz_attempt_answers.quiz_attempt_id
          AND a.student_id = auth.uid()
      )
    );
  END IF;

  -- Students can view their own answers
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='quiz_attempt_answers' AND policyname='Students select their own attempt answers'
  ) THEN
    CREATE POLICY "Students select their own attempt answers"
    ON public.quiz_attempt_answers
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.quiz_attempts a
        WHERE a.id = quiz_attempt_answers.quiz_attempt_id
          AND a.student_id = auth.uid()
      )
    );
  END IF;

  -- Instructors can view answers for their quizzes
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='quiz_attempt_answers' AND policyname='Instructors view answers for their quizzes'
  ) THEN
    CREATE POLICY "Instructors view answers for their quizzes"
    ON public.quiz_attempt_answers
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1
        FROM public.quiz_attempts a
        JOIN public.quizzes q ON q.id = a.quiz_id
        JOIN public.lessons l ON l.id = q.lesson_id
        JOIN public.courses c ON c.id = l.course_id
        WHERE a.id = quiz_attempt_answers.quiz_attempt_id
          AND c.instructor_id = auth.uid()
      )
    );
  END IF;

  -- Instructors can update answers correctness for their quizzes
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='quiz_attempt_answers' AND policyname='Instructors update answers for their quizzes'
  ) THEN
    CREATE POLICY "Instructors update answers for their quizzes"
    ON public.quiz_attempt_answers
    FOR UPDATE
    USING (
      EXISTS (
        SELECT 1
        FROM public.quiz_attempts a
        JOIN public.quizzes q ON q.id = a.quiz_id
        JOIN public.lessons l ON l.id = q.lesson_id
        JOIN public.courses c ON c.id = l.course_id
        WHERE a.id = quiz_attempt_answers.quiz_attempt_id
          AND c.instructor_id = auth.uid()
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1
        FROM public.quiz_attempts a
        JOIN public.quizzes q ON q.id = a.quiz_id
        JOIN public.lessons l ON l.id = q.lesson_id
        JOIN public.courses c ON c.id = l.course_id
        WHERE a.id = quiz_attempt_answers.quiz_attempt_id
          AND c.instructor_id = auth.uid()
      )
    );
  END IF;
END $$;

-- 5) Allow instructors to update quiz_attempts (for review) and view attempts
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='quiz_attempts' AND policyname='Instructors can update attempts for their quizzes'
  ) THEN
    CREATE POLICY "Instructors can update attempts for their quizzes"
    ON public.quiz_attempts
    FOR UPDATE
    USING (
      EXISTS (
        SELECT 1
        FROM public.quizzes q
        JOIN public.lessons l ON l.id = q.lesson_id
        JOIN public.courses c ON c.id = l.course_id
        WHERE q.id = quiz_attempts.quiz_id AND c.instructor_id = auth.uid()
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1
        FROM public.quizzes q
        JOIN public.lessons l ON l.id = q.lesson_id
        JOIN public.courses c ON c.id = l.course_id
        WHERE q.id = quiz_attempts.quiz_id AND c.instructor_id = auth.uid()
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='quiz_attempts' AND policyname='Instructors can view attempts for their quizzes'
  ) THEN
    CREATE POLICY "Instructors can view attempts for their quizzes"
    ON public.quiz_attempts
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1
        FROM public.quizzes q
        JOIN public.lessons l ON l.id = q.lesson_id
        JOIN public.courses c ON c.id = l.course_id
        WHERE q.id = quiz_attempts.quiz_id AND c.instructor_id = auth.uid()
      )
    );
  END IF;
END $$;

-- 6) Trigger to set attempt_number sequentially per (student, quiz)
CREATE OR REPLACE FUNCTION public.set_quiz_attempt_number()
RETURNS trigger AS $$
DECLARE
  prev_count integer;
BEGIN
  SELECT COUNT(*) INTO prev_count FROM public.quiz_attempts
  WHERE student_id = NEW.student_id AND quiz_id = NEW.quiz_id;
  NEW.attempt_number := GREATEST(prev_count, 0) + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

DROP TRIGGER IF EXISTS trg_set_quiz_attempt_number ON public.quiz_attempts;
CREATE TRIGGER trg_set_quiz_attempt_number
BEFORE INSERT ON public.quiz_attempts
FOR EACH ROW
EXECUTE FUNCTION public.set_quiz_attempt_number();

-- 7) Trigger to set attempt status based on presence of QA questions
CREATE OR REPLACE FUNCTION public.set_attempt_status_from_quiz()
RETURNS trigger AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

DROP TRIGGER IF EXISTS trg_set_attempt_status ON public.quiz_attempts;
CREATE TRIGGER trg_set_attempt_status
BEFORE INSERT ON public.quiz_attempts
FOR EACH ROW
EXECUTE FUNCTION public.set_attempt_status_from_quiz();

-- 4) Add quiz_graded type to notifications table
ALTER TABLE public.notifications 
DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE public.notifications 
ADD CONSTRAINT notifications_type_check 
CHECK (type IN ('course_approval', 'course_rejection', 'blog_approval', 'blog_rejection', 'enrollment', 'system', 'quiz_graded'));