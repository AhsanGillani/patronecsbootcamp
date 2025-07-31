-- Add missing foreign key constraints to ensure data integrity

-- Add foreign key for lessons.course_id -> courses.id
ALTER TABLE public.lessons 
ADD CONSTRAINT fk_lessons_course_id 
FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;

-- Add foreign key for quizzes.lesson_id -> lessons.id
ALTER TABLE public.quizzes 
ADD CONSTRAINT fk_quizzes_lesson_id 
FOREIGN KEY (lesson_id) REFERENCES public.lessons(id) ON DELETE CASCADE;

-- Add foreign key for course_feedback.student_id -> profiles.user_id
ALTER TABLE public.course_feedback 
ADD CONSTRAINT fk_course_feedback_student_id 
FOREIGN KEY (student_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add foreign key for course_feedback.course_id -> courses.id
ALTER TABLE public.course_feedback 
ADD CONSTRAINT fk_course_feedback_course_id 
FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;

-- Add foreign key for blogs.category_id -> categories.id
ALTER TABLE public.blogs 
ADD CONSTRAINT fk_blogs_category_id 
FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;

-- Add foreign key for courses.category_id -> categories.id
ALTER TABLE public.courses 
ADD CONSTRAINT fk_courses_category_id 
FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;

-- Add foreign key for quiz_questions.quiz_id -> quizzes.id
ALTER TABLE public.quiz_questions 
ADD CONSTRAINT fk_quiz_questions_quiz_id 
FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id) ON DELETE CASCADE;