-- Fix the enum type mismatch
-- The system is looking for 'user_role' but we created 'app_role'
-- Let's create the missing type as an alias
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE public.user_role AS ENUM ('admin', 'instructor', 'student');
    END IF;
END $$;