-- Quick fix for RLS issues - creates permissive policies to get things working immediately

-- First, disable RLS on the problematic tables
ALTER TABLE IF EXISTS public.lesson_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.quiz_attempts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.quiz_attempt_answers DISABLE ROW LEVEL SECURITY;

-- Drop any existing policies that might be causing issues
DROP POLICY IF EXISTS "Students can view their own lesson progress" ON public.lesson_progress;
DROP POLICY IF EXISTS "Students can insert their own lesson progress" ON public.lesson_progress;
DROP POLICY IF EXISTS "Students can update their own lesson progress" ON public.lesson_progress;
DROP POLICY IF EXISTS "Students can delete their own lesson progress" ON public.lesson_progress;
DROP POLICY IF EXISTS "Allow all operations on lesson_progress" ON public.lesson_progress;
DROP POLICY IF EXISTS "fallback_lesson_progress" ON public.lesson_progress;

DROP POLICY IF EXISTS "Students can view their own quiz attempts" ON public.quiz_attempts;
DROP POLICY IF EXISTS "Students can insert their own quiz attempts" ON public.quiz_attempts;
DROP POLICY IF EXISTS "Students can update their own quiz attempts" ON public.quiz_attempts;
DROP POLICY IF EXISTS "Students can delete their own quiz attempts" ON public.quiz_attempts;
DROP POLICY IF EXISTS "Allow all operations on quiz_attempts" ON public.quiz_attempts;
DROP POLICY IF EXISTS "fallback_quiz_attempts" ON public.quiz_attempts;

-- Grant all permissions to authenticated users
GRANT ALL ON public.lesson_progress TO authenticated;
GRANT ALL ON public.quiz_attempts TO authenticated;
GRANT ALL ON public.quiz_attempt_answers TO authenticated;

-- Grant usage on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Create simple permissive policies that allow all operations for authenticated users
-- This is a temporary fix to get things working - you can make it more restrictive later
CREATE POLICY "allow_all_lesson_progress" ON public.lesson_progress
    FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "allow_all_quiz_attempts" ON public.quiz_attempts
    FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "allow_all_quiz_attempt_answers" ON public.quiz_attempt_answers
    FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Re-enable RLS with the new policies
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempt_answers ENABLE ROW LEVEL SECURITY;

-- Show what we created
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('lesson_progress', 'quiz_attempts', 'quiz_attempt_answers')
ORDER BY tablename, policyname;
