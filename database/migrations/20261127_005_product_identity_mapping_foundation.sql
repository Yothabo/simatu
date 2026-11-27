BEGIN;

-- Explicit, auditable identity crosswalk for legacy store products and the
-- store-independent Simatu catalogue candidate. No product rows are migrated
-- or matched automatically by this migration.
CREATE TABLE IF NOT EXISTS public.product_identity_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    store_id UUID NOT NULL
        REFERENCES public.stores(id) ON DELETE RESTRICT,

    legacy_product_id UUID NOT NULL,

    marketplace_product_id UUID NOT NULL
        REFERENCES public.marketplace_products(id) ON DELETE RESTRICT,

    mapping_status TEXT NOT NULL DEFAULT 'proposed'
        CHECK (mapping_status IN ('proposed', 'verified', 'rejected')),

    verification_notes TEXT,
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES public.admins(id) ON DELETE SET NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT product_identity_mapping_legacy_store_fkey
        FOREIGN KEY (store_id, legacy_product_id)
        REFERENCES public.products(store_id, id)
        ON DELETE RESTRICT,

    CONSTRAINT product_identity_mapping_legacy_unique
        UNIQUE (legacy_product_id),

    CONSTRAINT product_identity_mapping_store_core_unique
        UNIQUE (store_id, marketplace_product_id),

    CONSTRAINT product_identity_mapping_verified_fields_check
        CHECK (
            (mapping_status = 'verified' AND verified_at IS NOT NULL)
            OR mapping_status <> 'verified'
        )
);

CREATE INDEX IF NOT EXISTS product_identity_mappings_store_status_idx
    ON public.product_identity_mappings(store_id, mapping_status);

CREATE INDEX IF NOT EXISTS product_identity_mappings_core_idx
    ON public.product_identity_mappings(marketplace_product_id);

ALTER TABLE public.product_identity_mappings ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.product_identity_mappings
    FROM PUBLIC, anon, authenticated;

COMMENT ON TABLE public.product_identity_mappings IS
    'Explicit legacy store-product to Simatu catalogue identity crosswalk. Mapping rows are not auto-created; verification is required before migration or consumer cutover.';

COMMIT;
