-- First drop existing foreign key constraints, then recreate with ON DELETE CASCADE

-- Drop existing constraints if they exist
ALTER TABLE lessons DROP CONSTRAINT IF EXISTS fk_lessons_course_id;
ALTER TABLE quizzes DROP CONSTRAINT IF EXISTS fk_quizzes_lesson_id;
ALTER TABLE quiz_questions DROP CONSTRAINT IF EXISTS fk_quiz_questions_quiz_id;
ALTER TABLE quiz_attempts DROP CONSTRAINT IF EXISTS fk_quiz_attempts_quiz_id;
ALTER TABLE lesson_progress DROP CONSTRAINT IF EXISTS fk_lesson_progress_lesson_id;
ALTER TABLE course_feedback DROP CONSTRAINT IF EXISTS fk_course_feedback_course_id;
ALTER TABLE enrollments DROP CONSTRAINT IF EXISTS fk_enrollments_course_id;

-- Add foreign key constraints with ON DELETE CASCADE
ALTER TABLE lessons 
ADD CONSTRAINT fk_lessons_course_id 
FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;

ALTER TABLE quizzes 
ADD CONSTRAINT fk_quizzes_lesson_id 
FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE;

ALTER TABLE quiz_questions 
ADD CONSTRAINT fk_quiz_questions_quiz_id 
FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE;

ALTER TABLE quiz_attempts 
ADD CONSTRAINT fk_quiz_attempts_quiz_id 
FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE;

ALTER TABLE lesson_progress 
ADD CONSTRAINT fk_lesson_progress_lesson_id 
FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE;

ALTER TABLE course_feedback 
ADD CONSTRAINT fk_course_feedback_course_id 
FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;

ALTER TABLE enrollments 
ADD CONSTRAINT fk_enrollments_course_id 
FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;