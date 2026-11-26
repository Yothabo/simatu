BEGIN;

-- Independent marketplace catalogue. Unlike public.products, these records have no
-- storefront/store owner and are classified exclusively by platform taxonomy.
CREATE TABLE IF NOT EXISTS public.marketplace_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    sku TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL DEFAULT '',
    price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
    supplier_cost NUMERIC(12,2) CHECK (supplier_cost IS NULL OR supplier_cost >= 0),
    image_url TEXT NOT NULL,
    marketplace_category_id UUID NOT NULL
        REFERENCES public.marketplace_categories(id) ON DELETE RESTRICT,
    marketplace_subcategory_id UUID NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    marketplace_visible BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    product_source TEXT NOT NULL DEFAULT 'platform'
        CHECK (product_source IN ('platform', 'seed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT marketplace_products_subcategory_category_fkey
        FOREIGN KEY (marketplace_subcategory_id, marketplace_category_id)
        REFERENCES public.marketplace_subcategories(id, marketplace_category_id)
        ON DELETE RESTRICT,
    CONSTRAINT marketplace_products_name_valid
        CHECK (length(trim(name)) BETWEEN 1 AND 200),
    CONSTRAINT marketplace_products_sku_valid
        CHECK (length(trim(sku)) BETWEEN 1 AND 100),
    CONSTRAINT marketplace_products_image_valid
        CHECK (length(trim(image_url)) BETWEEN 1 AND 2048),
    CONSTRAINT marketplace_products_sort_order_valid
        CHECK (sort_order >= 0)
);

CREATE INDEX IF NOT EXISTS marketplace_products_category_active_idx
    ON public.marketplace_products(marketplace_category_id, is_active, sort_order);
CREATE INDEX IF NOT EXISTS marketplace_products_subcategory_active_idx
    ON public.marketplace_products(marketplace_subcategory_id, is_active, sort_order);

-- Product variants are first-class catalogue records, each with its own SKU and
-- price, and a JSON object of selected option values (e.g. size/color).
CREATE TABLE IF NOT EXISTS public.marketplace_product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    marketplace_product_id UUID NOT NULL
        REFERENCES public.marketplace_products(id) ON DELETE CASCADE,
    sku TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL DEFAULT '',
    price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
    supplier_cost NUMERIC(12,2) CHECK (supplier_cost IS NULL OR supplier_cost >= 0),
    options JSONB NOT NULL DEFAULT '{}'::jsonb
        CHECK (jsonb_typeof(options) = 'object'),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT marketplace_product_variants_sort_order_valid
        CHECK (sort_order >= 0)
);

CREATE INDEX IF NOT EXISTS marketplace_product_variants_product_active_idx
    ON public.marketplace_product_variants(marketplace_product_id, is_active, sort_order);

-- Extend the governed attribute engine for marketplace-owned products without
-- altering its existing store/product scopes or legacy products table.
ALTER TABLE public.product_attribute_definitions
    ADD COLUMN IF NOT EXISTS marketplace_product_id UUID
        REFERENCES public.marketplace_products(id) ON DELETE CASCADE;

ALTER TABLE public.product_attribute_definitions
    DROP CONSTRAINT IF EXISTS product_attribute_definition_scope_owner;

ALTER TABLE public.product_attribute_definitions
    ADD CONSTRAINT product_attribute_definition_scope_owner CHECK (
        (scope = 'system' AND store_id IS NULL AND product_id IS NULL AND marketplace_product_id IS NULL)
        OR (scope = 'store' AND store_id IS NOT NULL AND product_id IS NULL AND marketplace_product_id IS NULL)
        OR (scope = 'product' AND store_id IS NOT NULL AND product_id IS NOT NULL AND marketplace_product_id IS NULL)
        OR (scope = 'marketplace' AND store_id IS NULL AND product_id IS NULL AND marketplace_product_id IS NOT NULL)
    );

CREATE UNIQUE INDEX IF NOT EXISTS product_attribute_definition_marketplace_key_unique
    ON public.product_attribute_definitions (marketplace_product_id, attribute_key)
    WHERE scope = 'marketplace';

CREATE TABLE IF NOT EXISTS public.marketplace_product_attribute_values (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    marketplace_product_id UUID NOT NULL
        REFERENCES public.marketplace_products(id) ON DELETE CASCADE,
    definition_id UUID NOT NULL
        REFERENCES public.product_attribute_definitions(id) ON DELETE RESTRICT,
    value JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT marketplace_product_attribute_value_unique
        UNIQUE (marketplace_product_id, definition_id)
);

CREATE INDEX IF NOT EXISTS marketplace_product_attribute_values_definition_idx
    ON public.marketplace_product_attribute_values(definition_id);

-- Only trusted server functions may read/write this independent catalogue.
ALTER TABLE public.marketplace_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_product_attribute_values ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.marketplace_products FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.marketplace_product_variants FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.marketplace_product_attribute_values FROM PUBLIC, anon, authenticated;

COMMENT ON TABLE public.marketplace_products IS
    'Store-independent marketplace catalogue products, owned and classified by Simatu.';
COMMENT ON TABLE public.marketplace_product_variants IS
    'Selectable marketplace product variants with independent SKU and pricing.';
COMMENT ON TABLE public.marketplace_product_attribute_values IS
    'Governed attribute values for store-independent marketplace products.';

COMMIT;
