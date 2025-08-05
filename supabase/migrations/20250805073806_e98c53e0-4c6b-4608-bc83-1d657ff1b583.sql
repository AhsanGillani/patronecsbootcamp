-- Add foreign key constraints with CASCADE DELETE for proper cleanup

-- First, add foreign key constraint for lessons -> courses
ALTER TABLE public.lessons 
ADD CONSTRAINT fk_lessons_course_id 
FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;

-- Add foreign key constraint for quizzes -> lessons  
ALTER TABLE public.quizzes
ADD CONSTRAINT fk_quizzes_lesson_id
FOREIGN KEY (lesson_id) REFERENCES public.lessons(id) ON DELETE CASCADE;

-- Add foreign key constraint for quiz_questions -> quizzes
ALTER TABLE public.quiz_questions
ADD CONSTRAINT fk_quiz_questions_quiz_id  
FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id) ON DELETE CASCADE;

-- Add foreign key constraint for quiz_attempts -> quizzes
ALTER TABLE public.quiz_attempts
ADD CONSTRAINT fk_quiz_attempts_quiz_id
FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id) ON DELETE CASCADE;

-- Add foreign key constraint for lesson_progress -> lessons
ALTER TABLE public.lesson_progress
ADD CONSTRAINT fk_lesson_progress_lesson_id
FOREIGN KEY (lesson_id) REFERENCES public.lessons(id) ON DELETE CASCADE;

-- Add foreign key constraint for enrollments -> courses
ALTER TABLE public.enrollments
ADD CONSTRAINT fk_enrollments_course_id
FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;

-- Add foreign key constraint for course_feedback -> courses  
ALTER TABLE public.course_feedback
ADD CONSTRAINT fk_course_feedback_course_id
FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;

-- Add foreign key constraint for certificates -> courses
ALTER TABLE public.certificates
ADD CONSTRAINT fk_certificates_course_id
FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;