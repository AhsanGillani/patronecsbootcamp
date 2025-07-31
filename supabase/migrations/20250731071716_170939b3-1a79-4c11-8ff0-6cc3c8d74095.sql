-- Drop and recreate the trigger function with correct column handling
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create the function that matches the exact table structure
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- Insert with all required columns and proper type casting
  INSERT INTO public.profiles (
    user_id, 
    email, 
    full_name, 
    role, 
    status,
    bio,
    avatar_url
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email), -- fallback to email if no name
    COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'student'::user_role),
    'active'::account_status,
    NULL, -- bio starts as null
    NULL  -- avatar_url starts as null
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error for debugging
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RAISE; -- Re-raise the error to stop user creation
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();