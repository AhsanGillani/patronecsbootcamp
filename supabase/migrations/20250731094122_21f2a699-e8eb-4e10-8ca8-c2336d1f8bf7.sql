-- Create lesson progress tracking table
CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(student_id, lesson_id)
);

-- Create quiz attempts table
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,
  passed BOOLEAN DEFAULT false,
  answers JSONB NOT NULL DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create certificates table
CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  certificate_number TEXT NOT NULL UNIQUE,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(student_id, course_id)
);

-- Enable RLS on all tables
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lesson_progress
CREATE POLICY "Students can view their own lesson progress" 
ON public.lesson_progress FOR SELECT 
USING (student_id = auth.uid());

CREATE POLICY "Students can insert their own lesson progress" 
ON public.lesson_progress FOR INSERT 
WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can update their own lesson progress" 
ON public.lesson_progress FOR UPDATE 
USING (student_id = auth.uid());

CREATE POLICY "Instructors can view progress for their courses" 
ON public.lesson_progress FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.lessons l 
  JOIN public.courses c ON l.course_id = c.id 
  WHERE l.id = lesson_progress.lesson_id AND c.instructor_id = auth.uid()
));

-- RLS Policies for quiz_attempts
CREATE POLICY "Students can view their own quiz attempts" 
ON public.quiz_attempts FOR SELECT 
USING (student_id = auth.uid());

CREATE POLICY "Students can insert their own quiz attempts" 
ON public.quiz_attempts FOR INSERT 
WITH CHECK (student_id = auth.uid());

CREATE POLICY "Instructors can view attempts for their quizzes" 
ON public.quiz_attempts FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.quizzes q 
  JOIN public.lessons l ON q.lesson_id = l.id 
  JOIN public.courses c ON l.course_id = c.id 
  WHERE q.id = quiz_attempts.quiz_id AND c.instructor_id = auth.uid()
));

-- RLS Policies for certificates
CREATE POLICY "Students can view their own certificates" 
ON public.certificates FOR SELECT 
USING (student_id = auth.uid());

CREATE POLICY "Students can insert their own certificates" 
ON public.certificates FOR INSERT 
WITH CHECK (student_id = auth.uid());

CREATE POLICY "Instructors can view certificates for their courses" 
ON public.certificates FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.courses c 
  WHERE c.id = certificates.course_id AND c.instructor_id = auth.uid()
));

-- Add triggers for updated_at
CREATE TRIGGER update_lesson_progress_updated_at
  BEFORE UPDATE ON public.lesson_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate certificate number
CREATE OR REPLACE FUNCTION public.generate_certificate_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'CERT-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(FLOOR(RANDOM() * 999999)::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;