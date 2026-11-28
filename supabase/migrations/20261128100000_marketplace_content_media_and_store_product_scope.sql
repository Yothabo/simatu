BEGIN;

-- Marketplace taxonomy remains platform-owned. Store categories remain untouched.
ALTER TABLE public.marketplace_categories
  ADD COLUMN IF NOT EXISTS publication_status TEXT NOT NULL DEFAULT 'published',
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

ALTER TABLE public.marketplace_subcategories
  ADD COLUMN IF NOT EXISTS publication_status TEXT NOT NULL DEFAULT 'published',
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

ALTER TABLE public.marketplace_categories
  ADD CONSTRAINT marketplace_categories_publication_status_valid
  CHECK (publication_status IN ('draft', 'published', 'archived'));

ALTER TABLE public.marketplace_subcategories
  ADD CONSTRAINT marketplace_subcategories_publication_status_valid
  CHECK (publication_status IN ('draft', 'published', 'archived'));

UPDATE public.marketplace_categories
SET published_at = COALESCE(published_at, created_at)
WHERE publication_status = 'published';

UPDATE public.marketplace_subcategories
SET published_at = COALESCE(published_at, created_at)
WHERE publication_status = 'published';

-- Versioned image pairs: JPEG is the universal fallback; JXL is an optional
-- high-efficiency variant. The binary objects live in Supabase Storage.
CREATE TABLE public.marketplace_content_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  marketplace_category_id UUID REFERENCES public.marketplace_categories(id) ON DELETE RESTRICT,
  marketplace_subcategory_id UUID REFERENCES public.marketplace_subcategories(id) ON DELETE RESTRICT,
  jpeg_path TEXT NOT NULL,
  jxl_path TEXT NOT NULL,
  jpeg_size_bytes BIGINT NOT NULL,
  jxl_size_bytes BIGINT NOT NULL,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  alt_text TEXT NOT NULL,
  created_by UUID REFERENCES public.admins(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  retired_at TIMESTAMPTZ,
  CONSTRAINT marketplace_content_media_single_owner
    CHECK (num_nonnulls(marketplace_category_id, marketplace_subcategory_id) = 1),
  CONSTRAINT marketplace_content_media_jpeg_path_valid
    CHECK (jpeg_path ~ '^(categories|subcategories)/[0-9a-f-]+/[0-9a-f-]+\.jpg$'),
  CONSTRAINT marketplace_content_media_jxl_path_valid
    CHECK (jxl_path ~ '^(categories|subcategories)/[0-9a-f-]+/[0-9a-f-]+\.jxl$'),
  CONSTRAINT marketplace_content_media_sizes_valid
    CHECK (jpeg_size_bytes > 0 AND jxl_size_bytes > 0),
  CONSTRAINT marketplace_content_media_dimensions_valid
    CHECK (width BETWEEN 1 AND 6000 AND height BETWEEN 1 AND 6000),
  CONSTRAINT marketplace_content_media_alt_valid
    CHECK (length(alt_text) BETWEEN 1 AND 250 AND alt_text = trim(alt_text))
);

CREATE UNIQUE INDEX marketplace_content_media_active_category_idx
  ON public.marketplace_content_media (marketplace_category_id)
  WHERE marketplace_category_id IS NOT NULL AND retired_at IS NULL;

CREATE UNIQUE INDEX marketplace_content_media_active_subcategory_idx
  ON public.marketplace_content_media (marketplace_subcategory_id)
  WHERE marketplace_subcategory_id IS NOT NULL AND retired_at IS NULL;

CREATE INDEX marketplace_content_media_created_idx
  ON public.marketplace_content_media (created_at DESC);

ALTER TABLE public.marketplace_categories
  ADD COLUMN image_media_id UUID REFERENCES public.marketplace_content_media(id) ON DELETE RESTRICT;

ALTER TABLE public.marketplace_subcategories
  ADD COLUMN image_media_id UUID REFERENCES public.marketplace_content_media(id) ON DELETE RESTRICT;

-- A store is assigned to one or more global categories. Exactly one assignment
-- is its primary placement; products are classified to subcategories.
ALTER TABLE public.store_marketplace_categories
  ADD COLUMN is_primary BOOLEAN NOT NULL DEFAULT FALSE;

WITH ranked AS (
  SELECT store_id, marketplace_category_id,
         ROW_NUMBER() OVER (PARTITION BY store_id ORDER BY created_at, marketplace_category_id) AS position
  FROM public.store_marketplace_categories
)
UPDATE public.store_marketplace_categories smc
SET is_primary = TRUE
FROM ranked
WHERE ranked.store_id = smc.store_id
  AND ranked.marketplace_category_id = smc.marketplace_category_id
  AND ranked.position = 1;

CREATE UNIQUE INDEX store_marketplace_categories_one_primary_idx
  ON public.store_marketplace_categories (store_id)
  WHERE is_primary IS TRUE;

CREATE INDEX store_marketplace_categories_primary_idx
  ON public.store_marketplace_categories (store_id, marketplace_category_id)
  WHERE is_primary IS TRUE;

-- Ensure a product's platform subcategory belongs to a category assigned to
-- that product's store. Legacy products without a platform subcategory remain valid.
CREATE OR REPLACE FUNCTION public.enforce_product_marketplace_store_category()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $function$
DECLARE
  v_store_id UUID;
  v_category_id UUID;
BEGIN
  IF NEW.marketplace_subcategory_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT id INTO v_store_id
  FROM public.stores
  WHERE slug = NEW.storefront
    AND is_active IS TRUE;

  IF v_store_id IS NULL THEN
    RAISE EXCEPTION 'A valid active store is required for marketplace product classification.'
      USING ERRCODE = '23503';
  END IF;

  SELECT marketplace_category_id INTO v_category_id
  FROM public.marketplace_subcategories
  WHERE id = NEW.marketplace_subcategory_id
    AND is_active IS TRUE
    AND publication_status = 'published';

  IF v_category_id IS NULL THEN
    RAISE EXCEPTION 'The selected marketplace subcategory is unavailable.'
      USING ERRCODE = '23503';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.store_marketplace_categories
    WHERE store_id = v_store_id
      AND marketplace_category_id = v_category_id
  ) THEN
    RAISE EXCEPTION 'The product subcategory must belong to a category assigned to its store.'
      USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_enforce_product_marketplace_store_category ON public.products;
CREATE TRIGGER trg_enforce_product_marketplace_store_category
BEFORE INSERT OR UPDATE OF storefront, marketplace_subcategory_id
ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.enforce_product_marketplace_store_category();

-- Prevent removing a store/category assignment while products still use one
-- of that category's marketplace subcategories.
CREATE OR REPLACE FUNCTION public.prevent_used_store_marketplace_category_removal()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $function$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.products p
    JOIN public.stores s ON s.slug = p.storefront
    JOIN public.marketplace_subcategories msc
      ON msc.id = p.marketplace_subcategory_id
    WHERE s.id = OLD.store_id
      AND msc.marketplace_category_id = OLD.marketplace_category_id
  ) THEN
    RAISE EXCEPTION 'This category is used by marketplace-classified products for the store.'
      USING ERRCODE = '23503';
  END IF;

  RETURN OLD;
END;
$function$;

DROP TRIGGER IF EXISTS trg_prevent_used_store_marketplace_category_removal
  ON public.store_marketplace_categories;
CREATE TRIGGER trg_prevent_used_store_marketplace_category_removal
BEFORE DELETE ON public.store_marketplace_categories
FOR EACH ROW
EXECUTE FUNCTION public.prevent_used_store_marketplace_category_removal();

ALTER TABLE public.marketplace_content_media ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.marketplace_content_media FROM PUBLIC, anon, authenticated;

-- Public delivery is read-only. Writes are performed by the authenticated
-- server-side media function using the Supabase service-role credential.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'marketplace-media',
  'marketplace-media',
  TRUE,
  5242880,
  ARRAY['image/jpeg', 'image/jxl']
)
ON CONFLICT (id) DO UPDATE
SET public = TRUE,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

COMMIT;
