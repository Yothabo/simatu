BEGIN;

-- Platform-owned product discovery classification, independent of storefront
-- categories/subcategories. Legacy products remain unclassified until reviewed.
CREATE TABLE public.marketplace_subcategories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    marketplace_category_id UUID NOT NULL
        REFERENCES public.marketplace_categories(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT marketplace_subcategories_name_valid
        CHECK (length(name) BETWEEN 1 AND 120 AND name = trim(name)),
    CONSTRAINT marketplace_subcategories_slug_valid
        CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
    CONSTRAINT marketplace_subcategories_sort_order_valid
        CHECK (sort_order >= 0),
    CONSTRAINT marketplace_subcategories_category_slug_unique
        UNIQUE (marketplace_category_id, slug),
    CONSTRAINT marketplace_subcategories_id_category_unique
        UNIQUE (id, marketplace_category_id)
);

CREATE INDEX marketplace_subcategories_active_order_idx
    ON public.marketplace_subcategories (marketplace_category_id, is_active, sort_order, name);

ALTER TABLE public.marketplace_subcategories ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.marketplace_subcategories FROM PUBLIC, anon, authenticated;

ALTER TABLE public.products
    ADD COLUMN IF NOT EXISTS marketplace_subcategory_id UUID
    REFERENCES public.marketplace_subcategories(id) ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS products_marketplace_subcategory_idx
    ON public.products (marketplace_subcategory_id)
    WHERE marketplace_subcategory_id IS NOT NULL;

COMMENT ON COLUMN public.products.marketplace_subcategory_id IS
    'Platform-managed discovery classification. Nullable for legacy/unclassified products.';

COMMIT;
