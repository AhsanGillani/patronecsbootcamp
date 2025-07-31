-- Create lessons table
CREATE TABLE public.lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  type TEXT NOT NULL CHECK (type IN ('video', 'text', 'pdf', 'quiz')),
  order_index INTEGER NOT NULL DEFAULT 0,
  video_url TEXT,
  pdf_url TEXT,
  duration INTEGER, -- in minutes
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quizzes table
CREATE TABLE public.quizzes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  passing_score INTEGER NOT NULL DEFAULT 70,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quiz_questions table
CREATE TABLE public.quiz_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL,
  question TEXT NOT NULL,
  options JSONB NOT NULL, -- array of options
  correct_answer INTEGER NOT NULL, -- index of correct option
  explanation TEXT,
  difficulty TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('course_approval', 'course_rejection', 'blog_approval', 'blog_rejection', 'enrollment', 'system')),
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create course_feedback table
CREATE TABLE public.course_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL,
  student_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(course_id, student_id)
);

-- Add soft_deleted column to courses
ALTER TABLE public.courses ADD COLUMN soft_deleted BOOLEAN NOT NULL DEFAULT false;

-- Add lesson count and duration to courses
ALTER TABLE public.courses ADD COLUMN lesson_count INTEGER DEFAULT 0;
ALTER TABLE public.courses ADD COLUMN total_duration INTEGER DEFAULT 0; -- in minutes

-- Add is_published column to blogs (if not exists)
ALTER TABLE public.blogs ADD COLUMN is_published BOOLEAN NOT NULL DEFAULT false;

-- Enable RLS on all new tables
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_feedback ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for lessons
CREATE POLICY "Instructors can view their course lessons" 
ON public.lessons FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.courses c 
    WHERE c.id = lessons.course_id 
    AND c.instructor_id = auth.uid()
  ) OR is_admin()
);

CREATE POLICY "Instructors can insert lessons for their courses" 
ON public.lessons FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.courses c 
    WHERE c.id = lessons.course_id 
    AND c.instructor_id = auth.uid()
  )
);

CREATE POLICY "Instructors can update their course lessons" 
ON public.lessons FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.courses c 
    WHERE c.id = lessons.course_id 
    AND c.instructor_id = auth.uid()
  ) OR is_admin()
);

CREATE POLICY "Instructors can delete their course lessons" 
ON public.lessons FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.courses c 
    WHERE c.id = lessons.course_id 
    AND c.instructor_id = auth.uid()
  ) OR is_admin()
);

-- Create RLS policies for quizzes
CREATE POLICY "Instructors can view quizzes for their lessons" 
ON public.quizzes FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.lessons l 
    JOIN public.courses c ON c.id = l.course_id
    WHERE l.id = quizzes.lesson_id 
    AND c.instructor_id = auth.uid()
  ) OR is_admin()
);

CREATE POLICY "Instructors can create quizzes for their lessons" 
ON public.quizzes FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.lessons l 
    JOIN public.courses c ON c.id = l.course_id
    WHERE l.id = quizzes.lesson_id 
    AND c.instructor_id = auth.uid()
  )
);

CREATE POLICY "Instructors can update quizzes for their lessons" 
ON public.quizzes FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.lessons l 
    JOIN public.courses c ON c.id = l.course_id
    WHERE l.id = quizzes.lesson_id 
    AND c.instructor_id = auth.uid()
  ) OR is_admin()
);

CREATE POLICY "Instructors can delete quizzes for their lessons" 
ON public.quizzes FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.lessons l 
    JOIN public.courses c ON c.id = l.course_id
    WHERE l.id = quizzes.lesson_id 
    AND c.instructor_id = auth.uid()
  ) OR is_admin()
);

-- Create RLS policies for quiz_questions
CREATE POLICY "Instructors can view questions for their quizzes" 
ON public.quiz_questions FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.quizzes q
    JOIN public.lessons l ON l.id = q.lesson_id
    JOIN public.courses c ON c.id = l.course_id
    WHERE q.id = quiz_questions.quiz_id 
    AND c.instructor_id = auth.uid()
  ) OR is_admin()
);

CREATE POLICY "Instructors can create questions for their quizzes" 
ON public.quiz_questions FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.quizzes q
    JOIN public.lessons l ON l.id = q.lesson_id
    JOIN public.courses c ON c.id = l.course_id
    WHERE q.id = quiz_questions.quiz_id 
    AND c.instructor_id = auth.uid()
  )
);

CREATE POLICY "Instructors can update questions for their quizzes" 
ON public.quiz_questions FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.quizzes q
    JOIN public.lessons l ON l.id = q.lesson_id
    JOIN public.courses c ON c.id = l.course_id
    WHERE q.id = quiz_questions.quiz_id 
    AND c.instructor_id = auth.uid()
  ) OR is_admin()
);

CREATE POLICY "Instructors can delete questions for their quizzes" 
ON public.quiz_questions FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.quizzes q
    JOIN public.lessons l ON l.id = q.lesson_id
    JOIN public.courses c ON c.id = l.course_id
    WHERE q.id = quiz_questions.quiz_id 
    AND c.instructor_id = auth.uid()
  ) OR is_admin()
);

-- Create RLS policies for notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notifications FOR SELECT 
USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "Admins can create notifications" 
ON public.notifications FOR INSERT 
WITH CHECK (is_admin());

CREATE POLICY "Users can update their own notifications" 
ON public.notifications FOR UPDATE 
USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "Users can delete their own notifications" 
ON public.notifications FOR DELETE 
USING (user_id = auth.uid() OR is_admin());

-- Create RLS policies for course_feedback
CREATE POLICY "Students can view their own feedback" 
ON public.course_feedback FOR SELECT 
USING (student_id = auth.uid() OR is_admin() OR 
  EXISTS (
    SELECT 1 FROM public.courses c 
    WHERE c.id = course_feedback.course_id 
    AND c.instructor_id = auth.uid()
  )
);

CREATE POLICY "Students can create feedback for enrolled courses" 
ON public.course_feedback FOR INSERT 
WITH CHECK (
  student_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.enrollments e 
    WHERE e.course_id = course_feedback.course_id 
    AND e.student_id = auth.uid()
  )
);

CREATE POLICY "Students can update their own feedback" 
ON public.course_feedback FOR UPDATE 
USING (student_id = auth.uid() OR is_admin());

-- Create triggers for updated_at
CREATE TRIGGER update_lessons_updated_at
  BEFORE UPDATE ON public.lessons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quizzes_updated_at
  BEFORE UPDATE ON public.quizzes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to update course lesson stats
CREATE OR REPLACE FUNCTION public.update_course_lesson_stats()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update course stats
CREATE TRIGGER update_course_stats_on_lesson_change
  AFTER INSERT OR UPDATE OR DELETE ON public.lessons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_course_lesson_stats();