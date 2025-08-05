-- Add foreign key constraints with ON DELETE CASCADE

-- Add foreign key for lessons.course_id
ALTER TABLE lessons 
ADD CONSTRAINT fk_lessons_course_id 
FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;

-- Add foreign key for quizzes.lesson_id
ALTER TABLE quizzes 
ADD CONSTRAINT fk_quizzes_lesson_id 
FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE;

-- Add foreign key for quiz_questions.quiz_id
ALTER TABLE quiz_questions 
ADD CONSTRAINT fk_quiz_questions_quiz_id 
FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE;

-- Add foreign key for quiz_attempts.quiz_id
ALTER TABLE quiz_attempts 
ADD CONSTRAINT fk_quiz_attempts_quiz_id 
FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE;

-- Add foreign key for lesson_progress.lesson_id
ALTER TABLE lesson_progress 
ADD CONSTRAINT fk_lesson_progress_lesson_id 
FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE;

-- Add foreign key for course_feedback.course_id
ALTER TABLE course_feedback 
ADD CONSTRAINT fk_course_feedback_course_id 
FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;

-- Add foreign key for enrollments.course_id
ALTER TABLE enrollments 
ADD CONSTRAINT fk_enrollments_course_id 
FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;