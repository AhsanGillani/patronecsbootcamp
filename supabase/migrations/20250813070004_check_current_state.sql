-- Simple diagnostic to check current database state

-- Check if tables exist
SELECT 'Tables that exist:' as info;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('lesson_progress', 'quiz_attempts', 'quiz_attempt_answers');

-- Check table columns
SELECT 'lesson_progress columns:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'lesson_progress' 
ORDER BY ordinal_position;

SELECT 'quiz_attempts columns:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'quiz_attempts' 
ORDER BY ordinal_position;

-- Check current RLS status
SELECT 'RLS status:' as info;
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('lesson_progress', 'quiz_attempts', 'quiz_attempt_answers');

-- Check current policies
SELECT 'Current policies:' as info;
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('lesson_progress', 'quiz_attempts', 'quiz_attempt_answers')
ORDER BY tablename, policyname;

-- Check sample data structure
SELECT 'Sample lesson_progress data:' as info;
SELECT * FROM lesson_progress LIMIT 1;

SELECT 'Sample quiz_attempts data:' as info;
SELECT * FROM quiz_attempts LIMIT 1;

-- Check current user
SELECT 'Current user info:' as info;
SELECT 
    current_user,
    session_user,
    current_setting('role') as current_role;
