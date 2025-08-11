-- Add slug to categories and auto-generate unique slugs
-- 1) Column
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS slug text;

-- 2) Unique index (ignore NULLs)
CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_slug_unique ON public.categories (slug) WHERE slug IS NOT NULL;

-- 3) Generator using existing slugify helper
CREATE OR REPLACE FUNCTION public.generate_category_slug(name text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  base text := COALESCE(public.slugify(name), 'category');
  candidate text := base;
  i int := 1;
BEGIN
  WHILE EXISTS (SELECT 1 FROM public.categories WHERE slug = candidate) LOOP
    i := i + 1;
    candidate := base || '-' || i::text;
  END LOOP;
  RETURN candidate;
END;
$$;

-- 4) Trigger function to set/maintain slug
CREATE OR REPLACE FUNCTION public.set_category_slug()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
      NEW.slug := public.generate_category_slug(NEW.name);
    ELSE
      NEW.slug := public.slugify(NEW.slug);
      IF EXISTS (SELECT 1 FROM public.categories WHERE slug = NEW.slug) THEN
        NEW.slug := public.generate_category_slug(NEW.slug);
      END IF;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.name IS DISTINCT FROM OLD.name AND (NEW.slug IS NULL OR NEW.slug = OLD.slug) THEN
      NEW.slug := public.generate_category_slug(NEW.name);
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- 5) Attach trigger
DROP TRIGGER IF EXISTS trg_set_category_slug ON public.categories;
CREATE TRIGGER trg_set_category_slug
BEFORE INSERT OR UPDATE ON public.categories
FOR EACH ROW
EXECUTE FUNCTION public.set_category_slug();

-- 6) Backfill existing rows
UPDATE public.categories
SET slug = public.generate_category_slug(name)
WHERE slug IS NULL OR slug = '';

-- 7) Optional helpful index for name lookups
CREATE INDEX IF NOT EXISTS idx_categories_name_trgm ON public.categories USING gin (name gin_trgm_ops);
