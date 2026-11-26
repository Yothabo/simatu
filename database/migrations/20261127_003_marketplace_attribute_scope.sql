BEGIN;

ALTER TABLE public.product_attribute_definitions
    DROP CONSTRAINT IF EXISTS product_attribute_definitions_scope_check;

ALTER TABLE public.product_attribute_definitions
    ADD CONSTRAINT product_attribute_definitions_scope_check
    CHECK (scope IN ('system', 'store', 'product', 'marketplace'));

COMMIT;
