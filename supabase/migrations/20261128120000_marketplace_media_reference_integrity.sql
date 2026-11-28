BEGIN;

-- Fail migration safely if legacy references are already inconsistent.
DO $audit$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.marketplace_categories c
    JOIN public.marketplace_content_media m ON m.id = c.image_media_id
    WHERE m.retired_at IS NOT NULL
       OR m.marketplace_category_id IS DISTINCT FROM c.id
       OR m.marketplace_subcategory_id IS NOT NULL
  ) OR EXISTS (
    SELECT 1
    FROM public.marketplace_subcategories s
    JOIN public.marketplace_content_media m ON m.id = s.image_media_id
    WHERE m.retired_at IS NOT NULL
       OR m.marketplace_subcategory_id IS DISTINCT FROM s.id
       OR m.marketplace_category_id IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'Existing marketplace media references are inconsistent; repair them before applying this migration.';
  END IF;
END;
$audit$;


-- Enforce that taxonomy image references point to media owned by the same entity.
-- Deferred validation allows the upload transaction to retire the previous media
-- and replace the entity reference atomically.
CREATE OR REPLACE FUNCTION public.validate_marketplace_category_media_reference()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.image_media_id IS NOT NULL AND NOT EXISTS (
    SELECT 1
    FROM public.marketplace_content_media m
    WHERE m.id = NEW.image_media_id
      AND m.marketplace_category_id = NEW.id
      AND m.marketplace_subcategory_id IS NULL
      AND m.retired_at IS NULL
  ) THEN
    RAISE EXCEPTION 'Category image must be active media owned by this category.'
      USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.validate_marketplace_subcategory_media_reference()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.image_media_id IS NOT NULL AND NOT EXISTS (
    SELECT 1
    FROM public.marketplace_content_media m
    WHERE m.id = NEW.image_media_id
      AND m.marketplace_subcategory_id = NEW.id
      AND m.marketplace_category_id IS NULL
      AND m.retired_at IS NULL
  ) THEN
    RAISE EXCEPTION 'Subcategory image must be active media owned by this subcategory.'
      USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.validate_marketplace_media_reference_integrity()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $function$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.marketplace_categories c
    JOIN public.marketplace_content_media m ON m.id = c.image_media_id
    WHERE m.retired_at IS NOT NULL
       OR m.marketplace_category_id IS DISTINCT FROM c.id
       OR m.marketplace_subcategory_id IS NOT NULL
  ) OR EXISTS (
    SELECT 1
    FROM public.marketplace_subcategories s
    JOIN public.marketplace_content_media m ON m.id = s.image_media_id
    WHERE m.retired_at IS NOT NULL
       OR m.marketplace_subcategory_id IS DISTINCT FROM s.id
       OR m.marketplace_category_id IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'Marketplace image references must point to active media owned by the referencing entity.'
      USING ERRCODE = '23514';
  END IF;
  RETURN NULL;
END;
$function$;

DROP TRIGGER IF EXISTS trg_validate_marketplace_category_media_reference
  ON public.marketplace_categories;
CREATE CONSTRAINT TRIGGER trg_validate_marketplace_category_media_reference
AFTER INSERT OR UPDATE OF image_media_id ON public.marketplace_categories
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION public.validate_marketplace_media_reference_integrity();

DROP TRIGGER IF EXISTS trg_validate_marketplace_subcategory_media_reference
  ON public.marketplace_subcategories;
CREATE CONSTRAINT TRIGGER trg_validate_marketplace_subcategory_media_reference
AFTER INSERT OR UPDATE OF image_media_id ON public.marketplace_subcategories
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION public.validate_marketplace_media_reference_integrity();

DROP TRIGGER IF EXISTS trg_validate_marketplace_media_retirement_reference
  ON public.marketplace_content_media;
CREATE CONSTRAINT TRIGGER trg_validate_marketplace_media_retirement_reference
AFTER UPDATE OF retired_at ON public.marketplace_content_media
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION public.validate_marketplace_media_reference_integrity();

-- Media ownership is immutable after creation, so an asset cannot be reassigned
-- across categories/subcategories through direct database writes.
CREATE OR REPLACE FUNCTION public.prevent_marketplace_media_owner_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.marketplace_category_id IS DISTINCT FROM OLD.marketplace_category_id
     OR NEW.marketplace_subcategory_id IS DISTINCT FROM OLD.marketplace_subcategory_id THEN
    RAISE EXCEPTION 'Marketplace media ownership is immutable.'
      USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_prevent_marketplace_media_owner_change
  ON public.marketplace_content_media;
CREATE TRIGGER trg_prevent_marketplace_media_owner_change
BEFORE UPDATE OF marketplace_category_id, marketplace_subcategory_id
ON public.marketplace_content_media
FOR EACH ROW
EXECUTE FUNCTION public.prevent_marketplace_media_owner_change();

COMMIT;
