BEGIN;

ALTER TABLE public.product_attribute_definitions
    DROP CONSTRAINT IF EXISTS product_attribute_definition_scope_owner;

ALTER TABLE public.product_attribute_definitions
    ADD CONSTRAINT product_attribute_definition_scope_owner CHECK (
        (scope = 'system' AND store_id IS NULL AND product_id IS NULL AND marketplace_product_id IS NULL)
        OR (scope = 'store' AND store_id IS NOT NULL AND product_id IS NULL AND marketplace_product_id IS NULL)
        OR (scope = 'product' AND store_id IS NOT NULL AND product_id IS NOT NULL AND marketplace_product_id IS NULL)
        OR (scope = 'marketplace' AND store_id IS NULL AND product_id IS NULL AND marketplace_product_id IS NOT NULL)
    );

COMMIT;
