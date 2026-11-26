BEGIN;

-- Platform-owned marketplace taxonomy. Store categories remain unchanged and
-- continue to govern the existing private storefront catalogue.
CREATE TABLE public.marketplace_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
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
        CHECK (sort_order >= 0)
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
INSERT INTO public.marketplace_categories (name, slug, description, sort_order)
VALUES
    ('Fashion', 'fashion', 'Clothing, footwear, accessories and style.', 10),
    ('Home & Spaces', 'spaces', 'Furniture, interiors and home living.', 20),
    ('Technology', 'technology', 'Electronics, technology and digital equipment.', 30),
    ('African Culture & Heritage', 'culture', 'African culture, heritage and creative expression.', 40),
    ('Everyday Living', 'living', 'Everyday essentials and practical living.', 50),
    ('Beauty & Care', 'beauty', 'Beauty, grooming and personal care.', 60),
    ('Sport & Fitness', 'sports', 'Sport, exercise and fitness.', 70),
    ('Food & Drink', 'food', 'Food, beverages and culinary products.', 80),
    ('Automotive', 'automotive', 'Vehicles, accessories and automotive services.', 90),
    ('Pets & Animals', 'pets', 'Pet products, animal care and services.', 100),
    ('Kids & Family', 'kids', 'Products and services for children and families.', 110),
    ('Art & Creativity', 'creative', 'Art, craft and creative tools.', 120),
    ('Events & Celebrations', 'events', 'Event products, services and celebrations.', 130),
    ('Hobbies & Collecting', 'hobbies', 'Hobbies, collectibles and specialist interests.', 140),
    ('Local & Personal Services', 'services', 'Local, personal and household services.', 150),
    ('Travel & Experiences', 'travel', 'Travel, accommodation and experiences.', 160),
    ('Business Services', 'business', 'Professional and operational business services.', 170),
    ('Digital Products', 'digital', 'Software, digital resources and downloads.', 180)
ON CONFLICT (slug) DO NOTHING;

ALTER TABLE public.marketplace_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_marketplace_categories ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.marketplace_categories
FROM PUBLIC, anon, authenticated;

REVOKE ALL ON TABLE public.store_marketplace_categories
FROM PUBLIC, anon, authenticated;

COMMIT;
