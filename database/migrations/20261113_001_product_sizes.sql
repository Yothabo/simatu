BEGIN;

-- =========================================================
-- PRODUCT SIZES (display-only)
-- Sizes are a list of labels on the product. Stock remains
-- per-product for now. A future migration can promote these
-- to first-class product_variants with per-size inventory.
-- =========================================================

ALTER TABLE public.products
    ADD COLUMN sizes TEXT[] NOT NULL DEFAULT '{}'::text[];

COMMIT;
