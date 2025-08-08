-- Add slug columns for courses and blogs, with indexes
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS slug text;

-- Unique indexes on non-null slugs
CREATE UNIQUE INDEX IF NOT EXISTS courses_slug_unique_idx ON public.courses (slug) WHERE slug IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS blogs_slug_unique_idx ON public.blogs (slug) WHERE slug IS NOT NULL;

-- Slugify helper (no extensions required)
CREATE OR REPLACE FUNCTION public.slugify(txt text)
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT CASE
    WHEN txt IS NULL THEN NULL
    ELSE trim(both '-' FROM regexp_replace(lower(txt), '[^a-z0-9]+', '-', 'g'))
  END
$$;

-- Generate unique slug for courses
CREATE OR REPLACE FUNCTION public.generate_course_slug(title text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $fn$
DECLARE
  base text := COALESCE(public.slugify(title), 'course');
  candidate text := base;
  i int := 1;
BEGIN
  WHILE EXISTS (SELECT 1 FROM public.courses WHERE slug = candidate) LOOP
    i := i + 1;
    candidate := base || '-' || i::text;
  END LOOP;
  RETURN candidate;
END;
$fn$;

-- Generate unique slug for blogs
CREATE OR REPLACE FUNCTION public.generate_blog_slug(title text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $fn$
DECLARE
  base text := COALESCE(public.slugify(title), 'blog');
  candidate text := base;
  i int := 1;
BEGIN
  WHILE EXISTS (SELECT 1 FROM public.blogs WHERE slug = candidate) LOOP
    i := i + 1;
    candidate := base || '-' || i::text;
  END LOOP;
  RETURN candidate;
END;
$fn$;

-- Trigger to maintain course slugs
CREATE OR REPLACE FUNCTION public.set_course_slug()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $tg$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
      NEW.slug := public.generate_course_slug(NEW.title);
    ELSE
      NEW.slug := public.slugify(NEW.slug);
      IF EXISTS (SELECT 1 FROM public.courses WHERE slug = NEW.slug) THEN
        NEW.slug := public.generate_course_slug(NEW.slug);
      END IF;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.title IS DISTINCT FROM OLD.title AND (NEW.slug IS NULL OR NEW.slug = OLD.slug) THEN
      NEW.slug := public.generate_course_slug(NEW.title);
    END IF;
  END IF;
  RETURN NEW;
END;
$tg$;

-- Trigger to maintain blog slugs
CREATE OR REPLACE FUNCTION public.set_blog_slug()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $tg$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
      NEW.slug := public.generate_blog_slug(NEW.title);
    ELSE
      NEW.slug := public.slugify(NEW.slug);
      IF EXISTS (SELECT 1 FROM public.blogs WHERE slug = NEW.slug) THEN
        NEW.slug := public.generate_blog_slug(NEW.slug);
      END IF;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.title IS DISTINCT FROM OLD.title AND (NEW.slug IS NULL OR NEW.slug = OLD.slug) THEN
      NEW.slug := public.generate_blog_slug(NEW.title);
    END IF;
  END IF;
  RETURN NEW;
END;
$tg$;

-- Create triggers
DROP TRIGGER IF EXISTS trg_set_course_slug ON public.courses;
CREATE TRIGGER trg_set_course_slug
BEFORE INSERT OR UPDATE ON public.courses
FOR EACH ROW
EXECUTE FUNCTION public.set_course_slug();

DROP TRIGGER IF EXISTS trg_set_blog_slug ON public.blogs;
CREATE TRIGGER trg_set_blog_slug
BEFORE INSERT OR UPDATE ON public.blogs
FOR EACH ROW
EXECUTE FUNCTION public.set_blog_slug();

-- Backfill existing records
UPDATE public.courses
SET slug = public.generate_course_slug(title)
WHERE (slug IS NULL OR slug = '');

UPDATE public.blogs
SET slug = public.generate_blog_slug(title)
WHERE (slug IS NULL OR slug = '');