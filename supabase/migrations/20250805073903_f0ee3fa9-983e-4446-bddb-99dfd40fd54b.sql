-- Add foreign key constraints with CASCADE DELETE for proper cleanup
-- Only add constraints that don't already exist

-- Check and add foreign key constraint for lessons -> courses if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_lessons_course_id' 
        AND table_name = 'lessons'
    ) THEN
        ALTER TABLE public.lessons 
        ADD CONSTRAINT fk_lessons_course_id 
        FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Check and add foreign key constraint for quizzes -> lessons if not exists  
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_quizzes_lesson_id' 
        AND table_name = 'quizzes'
    ) THEN
        ALTER TABLE public.quizzes
        ADD CONSTRAINT fk_quizzes_lesson_id
        FOREIGN KEY (lesson_id) REFERENCES public.lessons(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Check and add foreign key constraint for quiz_questions -> quizzes if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_quiz_questions_quiz_id' 
        AND table_name = 'quiz_questions'
    ) THEN
        ALTER TABLE public.quiz_questions
        ADD CONSTRAINT fk_quiz_questions_quiz_id  
        FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Check and add foreign key constraint for quiz_attempts -> quizzes if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_quiz_attempts_quiz_id' 
        AND table_name = 'quiz_attempts'
    ) THEN
        ALTER TABLE public.quiz_attempts
        ADD CONSTRAINT fk_quiz_attempts_quiz_id
        FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Check and add foreign key constraint for lesson_progress -> lessons if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_lesson_progress_lesson_id' 
        AND table_name = 'lesson_progress'
    ) THEN
        ALTER TABLE public.lesson_progress
        ADD CONSTRAINT fk_lesson_progress_lesson_id
        FOREIGN KEY (lesson_id) REFERENCES public.lessons(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Check and add foreign key constraint for enrollments -> courses if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_enrollments_course_id' 
        AND table_name = 'enrollments'
    ) THEN
        ALTER TABLE public.enrollments
        ADD CONSTRAINT fk_enrollments_course_id
        FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Check and add foreign key constraint for course_feedback -> courses if not exists  
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_course_feedback_course_id' 
        AND table_name = 'course_feedback'
    ) THEN
        ALTER TABLE public.course_feedback
        ADD CONSTRAINT fk_course_feedback_course_id
        FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Check and add foreign key constraint for certificates -> courses if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_certificates_course_id' 
        AND table_name = 'certificates'
    ) THEN
        ALTER TABLE public.certificates
        ADD CONSTRAINT fk_certificates_course_id
        FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;
    END IF;
END $$;