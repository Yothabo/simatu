BEGIN;

-- Flexible, governed product attributes. Universal product identity remains in
-- public.products; variable specifications are defined and stored separately.
CREATE TABLE public.product_attribute_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attribute_key TEXT NOT NULL,
    label TEXT NOT NULL,
    data_type TEXT NOT NULL CHECK (
        data_type IN ('text', 'number', 'boolean', 'date', 'measurement', 'select', 'multi_select')
    ),
    scope TEXT NOT NULL DEFAULT 'system' CHECK (
        scope IN ('system', 'store', 'product')
    ),
    store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    unit TEXT,
    validation JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_required BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT product_attribute_definition_scope_owner CHECK (
        (scope = 'system' AND store_id IS NULL AND product_id IS NULL)
        OR (scope = 'store' AND store_id IS NOT NULL AND product_id IS NULL)
        OR (scope = 'product' AND store_id IS NOT NULL AND product_id IS NOT NULL)
    ),
    CONSTRAINT product_attribute_definition_key_valid CHECK (
        attribute_key ~ '^[a-z][a-z0-9_]{0,79}$'
    ),
    CONSTRAINT product_attribute_definition_label_valid CHECK (
        length(trim(label)) BETWEEN 1 AND 120
    )
);

CREATE UNIQUE INDEX product_attribute_definition_system_key_unique
    ON public.product_attribute_definitions (attribute_key)
    WHERE scope = 'system';

CREATE UNIQUE INDEX product_attribute_definition_store_key_unique
    ON public.product_attribute_definitions (store_id, attribute_key)
    WHERE scope = 'store';

CREATE UNIQUE INDEX product_attribute_definition_product_key_unique
    ON public.product_attribute_definitions (product_id, attribute_key)
    WHERE scope = 'product';

CREATE INDEX product_attribute_definitions_active_scope_idx
    ON public.product_attribute_definitions (scope, is_active, sort_order);

CREATE TABLE public.product_attribute_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    definition_id UUID NOT NULL
        REFERENCES public.product_attribute_definitions(id) ON DELETE CASCADE,
    option_value TEXT NOT NULL,
    option_label TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT product_attribute_option_value_unique
        UNIQUE (definition_id, option_value),
    CONSTRAINT product_attribute_option_label_valid
        CHECK (length(trim(option_label)) BETWEEN 1 AND 120)
);

CREATE INDEX product_attribute_options_active_order_idx
    ON public.product_attribute_options (definition_id, is_active, sort_order);

CREATE TABLE public.product_attribute_values (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL
        REFERENCES public.products(id) ON DELETE CASCADE,
    definition_id UUID NOT NULL
        REFERENCES public.product_attribute_definitions(id) ON DELETE RESTRICT,
    value JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT product_attribute_value_product_definition_unique
        UNIQUE (product_id, definition_id)
);

CREATE INDEX product_attribute_values_definition_idx
    ON public.product_attribute_values (definition_id);

-- Attribute tables are managed by trusted server functions, not public clients.
ALTER TABLE public.product_attribute_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_attribute_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_attribute_values ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.product_attribute_definitions
    FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.product_attribute_options
    FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.product_attribute_values
    FROM PUBLIC, anon, authenticated;

COMMIT;
