-- Add RLS policy for students to view quizzes for enrolled courses
CREATE POLICY "Students can view quizzes for enrolled courses" ON quizzes
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM enrollments e
    JOIN lessons l ON l.course_id = e.course_id
    WHERE l.id = quizzes.lesson_id 
    AND e.student_id = auth.uid()
  )
);

-- Add RLS policy for students to view quiz questions for enrolled course quizzes
CREATE POLICY "Students can view questions for enrolled course quizzes" ON quiz_questions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM enrollments e
    JOIN lessons l ON l.course_id = e.course_id  
    JOIN quizzes q ON q.lesson_id = l.id
    WHERE q.id = quiz_questions.quiz_id
    AND e.student_id = auth.uid()
  )
);