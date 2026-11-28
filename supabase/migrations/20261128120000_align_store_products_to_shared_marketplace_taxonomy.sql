BEGIN;

-- New store products use Simatu's shared marketplace taxonomy. The old
-- store-owned category tables remain intact for legacy records and rollback
-- compatibility, but they are no longer required for new product records.
ALTER TABLE public.products
  ALTER COLUMN category_id DROP NOT NULL,
  ALTER COLUMN subcategory_id DROP NOT NULL;

COMMENT ON COLUMN public.products.category_id IS
  'Legacy store-owned category reference. New products use marketplace_subcategory_id.';
COMMENT ON COLUMN public.products.subcategory_id IS
  'Legacy store-owned subcategory reference. New products use marketplace_subcategory_id.';

-- Keep legacy product references working, while allowing newly classified
-- products to use the shared platform taxonomy without fake His/Hers mappings.
CREATE OR REPLACE FUNCTION public.sync_product_catalogue_refs()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $function$
DECLARE
  v_store_id UUID;
  v_category_id UUID;
  v_category_name TEXT;
  v_subcategory_id UUID;
  v_subcategory_name TEXT;
BEGIN
  SELECT id
  INTO v_store_id
  FROM public.stores
  WHERE slug = NEW.storefront
    AND is_active IS TRUE;

  IF v_store_id IS NULL THEN
    RAISE EXCEPTION 'Unknown or inactive storefront: %', NEW.storefront
      USING ERRCODE = '23503';
  END IF;

  IF TG_OP = 'UPDATE'
     AND NEW.store_id IS NOT NULL
     AND NEW.store_id <> v_store_id THEN
    RAISE EXCEPTION 'Product store_id does not match its storefront.'
      USING ERRCODE = '23514';
  END IF;

  NEW.store_id := v_store_id;

  -- Shared marketplace classification is authoritative whenever present.
  -- Clear old store-owned references on the next save instead of allowing two
  -- competing taxonomies to remain attached to the same product.
  IF NEW.marketplace_subcategory_id IS NOT NULL THEN
    SELECT mc.name, msc.name
    INTO v_category_name, v_subcategory_name
    FROM public.marketplace_subcategories msc
    JOIN public.marketplace_categories mc
      ON mc.id = msc.marketplace_category_id
    JOIN public.store_marketplace_categories smc
      ON smc.marketplace_category_id = mc.id
     AND smc.store_id = v_store_id
    WHERE msc.id = NEW.marketplace_subcategory_id
      AND msc.is_active IS TRUE
      AND msc.publication_status = 'published'
      AND mc.is_active IS TRUE
      AND mc.publication_status = 'published'
      AND mc.audience_policy = 'general'
    FOR KEY SHARE OF smc;

    IF v_category_name IS NULL OR v_subcategory_name IS NULL THEN
      RAISE EXCEPTION 'The selected marketplace subcategory is unavailable or not assigned to this store.'
        USING ERRCODE = '23514';
    END IF;

    NEW.category_id := NULL;
    NEW.subcategory_id := NULL;
    NEW.category := v_category_name;
    NEW.subcategory := v_subcategory_name;
    RETURN NEW;
  END IF;

  IF NEW.category_id IS NULL AND NEW.subcategory_id IS NULL THEN
    RAISE EXCEPTION 'A marketplace subcategory is required for store products.'
      USING ERRCODE = '23514';
  END IF;

  -- Partially populated legacy references are never valid.
  IF NEW.category_id IS NULL OR NEW.subcategory_id IS NULL THEN
    RAISE EXCEPTION 'Legacy category and subcategory references must be supplied together.'
      USING ERRCODE = '23514';
  END IF;

  -- Preserve the existing store-owned taxonomy path for pre-migration rows.
  IF TG_OP = 'INSERT' AND NEW.category_id IS NOT NULL THEN
    SELECT id, name INTO v_category_id, v_category_name
    FROM public.categories
    WHERE id = NEW.category_id AND store_id = v_store_id;
  ELSIF TG_OP = 'UPDATE' AND NEW.category_id IS DISTINCT FROM OLD.category_id THEN
    SELECT id, name INTO v_category_id, v_category_name
    FROM public.categories
    WHERE id = NEW.category_id AND store_id = v_store_id;
  ELSIF TG_OP = 'INSERT'
     OR (TG_OP = 'UPDATE' AND NEW.category IS DISTINCT FROM OLD.category) THEN
    SELECT id, name INTO v_category_id, v_category_name
    FROM public.categories
    WHERE store_id = v_store_id
      AND lower(name) = lower(
        CASE
          WHEN v_store_id = (SELECT id FROM public.stores WHERE slug = 'poshies')
           AND lower(trim(NEW.category)) = 'spaces'
          THEN 'Lounge'
          ELSE trim(NEW.category)
        END
      );
  ELSE
    SELECT id, name INTO v_category_id, v_category_name
    FROM public.categories
    WHERE id = NEW.category_id AND store_id = v_store_id;
  END IF;

  IF v_category_id IS NULL THEN
    RAISE EXCEPTION 'Category "%" does not exist in storefront "%".',
      NEW.category, NEW.storefront;
  END IF;

  NEW.category_id := v_category_id;

  IF TG_OP = 'INSERT' AND NEW.subcategory_id IS NOT NULL THEN
    SELECT id, name INTO v_subcategory_id, v_subcategory_name
    FROM public.subcategories
    WHERE id = NEW.subcategory_id
      AND store_id = v_store_id
      AND category_id = v_category_id;
  ELSIF TG_OP = 'UPDATE' AND NEW.subcategory_id IS DISTINCT FROM OLD.subcategory_id THEN
    SELECT id, name INTO v_subcategory_id, v_subcategory_name
    FROM public.subcategories
    WHERE id = NEW.subcategory_id
      AND store_id = v_store_id
      AND category_id = v_category_id;
  ELSIF TG_OP = 'INSERT'
     OR (TG_OP = 'UPDATE' AND (
       NEW.subcategory IS DISTINCT FROM OLD.subcategory
       OR v_category_id IS DISTINCT FROM OLD.category_id
     )) THEN
    SELECT id, name INTO v_subcategory_id, v_subcategory_name
    FROM public.subcategories
    WHERE store_id = v_store_id
      AND category_id = v_category_id
      AND lower(name) = lower(trim(NEW.subcategory));
  ELSE
    SELECT id, name INTO v_subcategory_id, v_subcategory_name
    FROM public.subcategories
    WHERE id = NEW.subcategory_id
      AND store_id = v_store_id
      AND category_id = v_category_id;
  END IF;

  IF v_subcategory_id IS NULL THEN
    RAISE EXCEPTION 'Subcategory "%" does not exist under category "%".',
      NEW.subcategory, v_category_name;
  END IF;

  NEW.subcategory_id := v_subcategory_id;
  NEW.category := v_category_name;
  NEW.subcategory := v_subcategory_name;
  RETURN NEW;
END;
$function$;

-- Marketplace-visible products cannot bypass the shared taxonomy or the
-- store/category membership relationship by changing visibility alone.
CREATE OR REPLACE FUNCTION public.enforce_product_marketplace_store_category()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $function$
DECLARE
  v_category_id UUID;
BEGIN
  IF NEW.marketplace_subcategory_id IS NULL THEN
    IF TG_OP = 'INSERT' OR NEW.marketplace_visible IS TRUE THEN
      RAISE EXCEPTION 'A marketplace subcategory is required for store products.'
        USING ERRCODE = '23514';
    END IF;
    RETURN NEW;
  END IF;

  SELECT mc.id
  INTO v_category_id
  FROM public.stores s
  JOIN public.store_marketplace_categories smc ON smc.store_id = s.id
  JOIN public.marketplace_categories mc ON mc.id = smc.marketplace_category_id
  JOIN public.marketplace_subcategories msc ON msc.marketplace_category_id = mc.id
  WHERE s.slug = NEW.storefront
    AND s.is_active IS TRUE
    AND msc.id = NEW.marketplace_subcategory_id
    AND msc.is_active IS TRUE
    AND msc.publication_status = 'published'
    AND mc.is_active IS TRUE
    AND mc.publication_status = 'published'
    AND mc.audience_policy = 'general'
  FOR KEY SHARE OF smc;

  IF v_category_id IS NULL THEN
    RAISE EXCEPTION 'The selected marketplace subcategory must be published and belong to a category assigned to the active store.'
      USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_enforce_product_marketplace_store_category
  ON public.products;

CREATE TRIGGER trg_enforce_product_marketplace_store_category
BEFORE INSERT OR UPDATE OF storefront, marketplace_subcategory_id, marketplace_visible
ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.enforce_product_marketplace_store_category();

COMMIT;
