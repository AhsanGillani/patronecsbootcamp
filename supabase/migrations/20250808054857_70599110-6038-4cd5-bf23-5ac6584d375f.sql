-- Set search_path for slugify to satisfy linter
CREATE OR REPLACE FUNCTION public.slugify(txt text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT CASE
    WHEN txt IS NULL THEN NULL
    ELSE trim(both '-' FROM regexp_replace(lower(txt), '[^a-z0-9]+', '-', 'g'))
  END
$$;