-- Fix Row Level Security for lesson_progress table
-- This migration adds proper RLS policies to allow students to manage their lesson progress

-- Enable RLS on lesson_progress table if not already enabled
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Students can view their own lesson progress" ON public.lesson_progress;
DROP POLICY IF EXISTS "Students can insert their own lesson progress" ON public.lesson_progress;
DROP POLICY IF EXISTS "Students can update their own lesson progress" ON public.lesson_progress;
DROP POLICY IF EXISTS "Students can delete their own lesson progress" ON public.lesson_progress;

-- Policy 1: Students can view their own lesson progress
CREATE POLICY "Students can view their own lesson progress" ON public.lesson_progress
    FOR SELECT USING (
        auth.uid()::text = student_id::text
    );

-- Policy 2: Students can insert their own lesson progress
CREATE POLICY "Students can insert their own lesson progress" ON public.lesson_progress
    FOR INSERT WITH CHECK (
        auth.uid()::text = student_id::text
    );

-- Policy 3: Students can update their own lesson progress
CREATE POLICY "Students can update their own lesson progress" ON public.lesson_progress
    FOR UPDATE USING (
        auth.uid()::text = student_id::text
    ) WITH CHECK (
        auth.uid()::text = student_id::text
    );

-- Policy 4: Students can delete their own lesson progress
CREATE POLICY "Students can delete their own lesson progress" ON public.lesson_progress
    FOR DELETE USING (
        auth.uid()::text = student_id::text
    );

-- Also add policies for quiz_attempts table to ensure proper access
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Students can view their own quiz attempts" ON public.quiz_attempts;
DROP POLICY IF EXISTS "Students can insert their own quiz attempts" ON public.quiz_attempts;
DROP POLICY IF EXISTS "Students can update their own quiz attempts" ON public.quiz_attempts;
DROP POLICY IF EXISTS "Students can delete their own quiz attempts" ON public.quiz_attempts;

-- Policy 1: Students can view their own quiz attempts
CREATE POLICY "Students can view their own quiz attempts" ON public.quiz_attempts
    FOR SELECT USING (
        auth.uid()::text = student_id::text
    );

-- Policy 2: Students can insert their own quiz attempts
CREATE POLICY "Students can insert their own quiz attempts" ON public.quiz_attempts
    FOR INSERT WITH CHECK (
        auth.uid()::text = student_id::text
    );

-- Policy 3: Students can update their own quiz attempts
CREATE POLICY "Students can update their own quiz attempts" ON public.quiz_attempts
    FOR UPDATE USING (
        auth.uid()::text = student_id::text
    ) WITH CHECK (
        auth.uid()::text = student_id::text
    );

-- Policy 4: Students can delete their own quiz attempts
CREATE POLICY "Students can delete their own quiz attempts" ON public.quiz_attempts
    FOR DELETE USING (
        auth.uid()::text = student_id::text
    );

-- Add policies for quiz_attempt_answers table
ALTER TABLE public.quiz_attempt_answers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Students can view their own quiz attempt answers" ON public.quiz_attempt_answers;
DROP POLICY IF EXISTS "Students can insert their own quiz attempt answers" ON public.quiz_attempt_answers;

-- Policy 1: Students can view their own quiz attempt answers (through quiz_attempts)
CREATE POLICY "Students can view their own quiz attempt answers" ON public.quiz_attempt_answers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.quiz_attempts qa
            WHERE qa.id = quiz_attempt_id
            AND auth.uid()::text = qa.student_id::text
        )
    );

-- Policy 2: Students can insert their own quiz attempt answers (through quiz_attempts)
CREATE POLICY "Students can insert their own quiz attempt answers" ON public.quiz_attempt_answers
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.quiz_attempts qa
            WHERE qa.id = quiz_attempt_id
            AND auth.uid()::text = qa.student_id::text
        )
    );

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lesson_progress TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quiz_attempts TO authenticated;
GRANT SELECT, INSERT ON public.quiz_attempt_answers TO authenticated;

-- Grant usage on sequences if they exist
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
