BEGIN;

-- A store product may only use a published, active, general-audience
-- marketplace subcategory whose parent category is also published and active.
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

  SELECT msc.marketplace_category_id INTO v_category_id
  FROM public.marketplace_subcategories msc
  JOIN public.marketplace_categories mc
    ON mc.id = msc.marketplace_category_id
  WHERE msc.id = NEW.marketplace_subcategory_id
    AND msc.is_active IS TRUE
    AND msc.publication_status = 'published'
    AND mc.is_active IS TRUE
    AND mc.publication_status = 'published'
    AND mc.audience_policy = 'general';

  IF v_category_id IS NULL THEN
    RAISE EXCEPTION 'The selected marketplace category or subcategory is not published and available.'
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

COMMIT;
