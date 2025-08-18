-- Diagnostic and fix for RLS issues
-- This migration will help identify and fix the root cause

-- First, let's check what tables exist and their structure
DO $$
DECLARE
    col_record record;
BEGIN
    -- Check if lesson_progress table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'lesson_progress') THEN
        RAISE NOTICE 'lesson_progress table exists';
        
        -- Check columns
        RAISE NOTICE 'Columns in lesson_progress:';
        FOR col_record IN 
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'lesson_progress' 
            ORDER BY ordinal_position
        LOOP
            RAISE NOTICE '  %: %', col_record.column_name, col_record.data_type;
        END LOOP;
    ELSE
        RAISE NOTICE 'lesson_progress table does not exist';
    END IF;
    
    -- Check if quiz_attempts table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'quiz_attempts') THEN
        RAISE NOTICE 'quiz_attempts table exists';
        
        -- Check columns
        RAISE NOTICE 'Columns in quiz_attempts:';
        FOR col_record IN 
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'quiz_attempts' 
            ORDER BY ordinal_position
        LOOP
            RAISE NOTICE '  %: %', col_record.column_name, col_record.data_type;
        END LOOP;
    ELSE
        RAISE NOTICE 'quiz_attempts table does not exist';
    END IF;
END $$;

-- Check current RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('lesson_progress', 'quiz_attempts', 'quiz_attempt_answers')
ORDER BY tablename, policyname;

-- Check if RLS is enabled on tables
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('lesson_progress', 'quiz_attempts', 'quiz_attempt_answers');

-- Check current user authentication
SELECT 
    current_user,
    session_user,
    current_setting('role'),
    current_setting('search_path');

-- Check if auth.uid() function exists and works
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'uid' AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'auth')) 
        THEN 'auth.uid() function exists'
        ELSE 'auth.uid() function does not exist'
    END as auth_uid_status;

-- Check sample data to understand the structure
SELECT 'lesson_progress sample data:' as info;
SELECT * FROM lesson_progress LIMIT 3;

SELECT 'quiz_attempts sample data:' as info;
SELECT * FROM quiz_attempts LIMIT 3;

-- Check if there are any existing RLS policies that might conflict
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('lesson_progress', 'quiz_attempts', 'quiz_attempt_answers')
AND (qual LIKE '%auth.uid%' OR qual LIKE '%student_id%');
