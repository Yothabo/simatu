BEGIN;

-- Store-specific commercial/presentation association. Product identity stays
-- store-independent in marketplace_products; listing fields belong to a store.
CREATE TABLE IF NOT EXISTS public.store_product_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL
        REFERENCES public.stores(id) ON DELETE RESTRICT,
    product_id UUID NOT NULL
        REFERENCES public.marketplace_products(id) ON DELETE RESTRICT,

    status TEXT NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'published', 'hidden', 'archived')),

    price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
    compare_at_price NUMERIC(12,2)
        CHECK (compare_at_price IS NULL OR compare_at_price >= 0),

    title_override TEXT,
    description_override TEXT,
    presentation_metadata JSONB NOT NULL DEFAULT '{}'::jsonb
        CHECK (jsonb_typeof(presentation_metadata) = 'object'),

    sort_order INTEGER NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT store_product_listings_store_product_unique
        UNIQUE (store_id, product_id),
    CONSTRAINT store_product_listings_title_override_valid
        CHECK (title_override IS NULL OR length(trim(title_override)) BETWEEN 1 AND 200),
    CONSTRAINT store_product_listings_compare_price_valid
        CHECK (compare_at_price IS NULL OR compare_at_price >= price)
);

CREATE INDEX IF NOT EXISTS store_product_listings_store_status_order_idx
    ON public.store_product_listings(store_id, status, sort_order);

CREATE INDEX IF NOT EXISTS store_product_listings_product_idx
    ON public.store_product_listings(product_id);

ALTER TABLE public.store_product_listings ENABLE ROW LEVEL SECURITY;

-- Writes and reads are performed through trusted server-side APIs until
-- listing authorization policies are explicitly designed and tested.
REVOKE ALL ON TABLE public.store_product_listings
    FROM PUBLIC, anon, authenticated;

COMMENT ON TABLE public.store_product_listings IS
    'Store-specific listing association and commercial/presentation settings for Simatu-owned product identity.';

COMMIT;
