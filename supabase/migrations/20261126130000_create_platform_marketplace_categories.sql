BEGIN;

-- Platform-owned marketplace taxonomy. Store categories remain unchanged and
-- continue to govern the existing private storefront catalogue.
CREATE TABLE public.marketplace_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    audience_policy TEXT NOT NULL DEFAULT 'general',
    minimum_age SMALLINT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT marketplace_categories_name_valid
        CHECK (
            length(name) BETWEEN 1 AND 120
            AND name = trim(name)
            AND name !~ '[[:cntrl:]]'
        ),
    CONSTRAINT marketplace_categories_slug_valid
        CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
    CONSTRAINT marketplace_categories_sort_order_valid
        CHECK (sort_order >= 0),
    CONSTRAINT marketplace_categories_audience_policy_valid
        CHECK (audience_policy IN ('general', 'restricted')),
    CONSTRAINT marketplace_categories_minimum_age_valid
        CHECK (minimum_age IS NULL OR minimum_age BETWEEN 0 AND 120),
    CONSTRAINT marketplace_categories_restricted_age_valid
        CHECK (audience_policy <> 'restricted' OR minimum_age BETWEEN 18 AND 120)
);

CREATE INDEX marketplace_categories_active_order_idx
    ON public.marketplace_categories (is_active, sort_order, name);

-- A business may participate in multiple platform-wide categories.
-- Stores are the existing business/store registry for this initial model.
CREATE TABLE public.store_marketplace_categories (
    store_id UUID NOT NULL
        REFERENCES public.stores(id) ON DELETE RESTRICT,
    marketplace_category_id UUID NOT NULL
        REFERENCES public.marketplace_categories(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (store_id, marketplace_category_id)
);

CREATE INDEX store_marketplace_categories_category_idx
    ON public.store_marketplace_categories (marketplace_category_id, store_id);

-- Seed the platform discovery categories. Store-specific catalogue categories
-- are deliberately not copied or replaced.
INSERT INTO public.marketplace_categories (name, slug, description, sort_order, audience_policy, minimum_age)
VALUES
    ('Fashion', 'fashion', 'Clothing, footwear, accessories and style.', 10, 'general', NULL),
    ('Home & Living', 'home-living', 'Furniture, interiors, household and everyday home essentials.', 20, 'general', NULL),
    ('Technology', 'technology', 'Consumer electronics, computing, audio and connected technology.', 30, 'general', NULL),
    ('African Culture & Heritage', 'culture', 'African culture, heritage and creative expression.', 40, 'general', NULL),
    ('Beauty & Care', 'beauty', 'Beauty, grooming and personal care.', 60, 'general', NULL),
    ('Sport & Fitness', 'sports', 'Sport, exercise and fitness.', 70, 'general', NULL),
    ('Food & Drink', 'food', 'Food, beverages and culinary products.', 80, 'general', NULL),
    ('Automotive', 'automotive', 'Vehicles, accessories and automotive services.', 90, 'general', NULL),
    ('Pets & Animals', 'pets', 'Pet products, animal care and services.', 100, 'general', NULL),
    ('Kids & Family', 'kids', 'Products and services for children and families.', 110, 'general', NULL),
    ('Art & Creativity', 'creative', 'Art, craft, creative tools and artistic services.', 120, 'general', NULL),
    ('Events & Celebrations', 'events', 'Event products, services and celebrations.', 130, 'general', NULL),
    ('Hobbies & Collecting', 'hobbies', 'Hobbies, collectibles and specialist interests.', 140, 'general', NULL),
    ('Local & Personal Services', 'services', 'Consumer-facing local, personal and household services.', 150, 'general', NULL),
    ('Travel & Experiences', 'travel', 'Travel, accommodation and destination experiences.', 160, 'general', NULL),
    ('Business Services', 'business', 'Professional and operational business services for organizations.', 170, 'general', NULL),
    ('Digital Products', 'digital', 'Software, digital resources and downloadable products.', 180, 'general', NULL),
    ('Age-Restricted', 'age-restricted', 'Restricted marketplace destination for approved age-gated products and services. Backend age verification and access enforcement are required.', 190, 'restricted', 18)
ON CONFLICT (slug) DO NOTHING;

ALTER TABLE public.marketplace_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_marketplace_categories ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.marketplace_categories
FROM PUBLIC, anon, authenticated;

REVOKE ALL ON TABLE public.store_marketplace_categories
FROM PUBLIC, anon, authenticated;

COMMIT;
