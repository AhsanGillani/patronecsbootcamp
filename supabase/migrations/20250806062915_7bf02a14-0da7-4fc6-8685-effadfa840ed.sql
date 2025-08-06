-- First, let's add a slug column to courses table for clean URLs
ALTER TABLE public.courses ADD COLUMN slug text;

-- Create a function to generate slug from title
CREATE OR REPLACE FUNCTION generate_slug(title text) 
RETURNS text 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN lower(regexp_replace(
    regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'), 
    '\s+', '-', 'g'
  ));
END;
$$;

-- Update existing courses with slugs based on their titles
UPDATE public.courses 
SET slug = generate_slug(title) || '-' || SUBSTRING(id::text, 1, 8)
WHERE slug IS NULL;

-- Make slug column not null and unique
ALTER TABLE public.courses 
ALTER COLUMN slug SET NOT NULL,
ADD CONSTRAINT courses_slug_unique UNIQUE (slug);

-- Create a trigger to auto-generate slug for new courses
CREATE OR REPLACE FUNCTION set_course_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL THEN
    NEW.slug := generate_slug(NEW.title) || '-' || SUBSTRING(NEW.id::text, 1, 8);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_course_slug_trigger
  BEFORE INSERT ON public.courses
  FOR EACH ROW
  EXECUTE FUNCTION set_course_slug();

-- Fix storage policies for avatars bucket
CREATE POLICY "Users can upload their own avatars"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatars"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatars"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'avatars');