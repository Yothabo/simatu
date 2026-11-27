-- Simatu platform advertising inventory foundation. Additive; review and apply manually.
CREATE TABLE IF NOT EXISTS public.simatu_platform_ads (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 name text NOT NULL CHECK (char_length(trim(name)) BETWEEN 2 AND 160),
 placement text NOT NULL CHECK (placement IN ('homepage_hero','homepage_featured','category_top','discovery_feed','product_sponsored')),
 format text NOT NULL CHECK (format IN ('image','native','banner')),
 headline text NOT NULL DEFAULT '' CHECK (char_length(headline) <= 200),
 description text NOT NULL DEFAULT '' CHECK (char_length(description) <= 2000),
 image_url text,
 destination_url text,
 status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','scheduled','active','paused','completed','archived')),
 starts_at timestamptz,
 ends_at timestamptz,
 priority integer NOT NULL DEFAULT 0 CHECK (priority >= 0),
 targeting jsonb NOT NULL DEFAULT '{}' CHECK (jsonb_typeof(targeting)='object'),
 metadata jsonb NOT NULL DEFAULT '{}' CHECK (jsonb_typeof(metadata)='object'),
 created_by uuid REFERENCES public.admins(id) ON DELETE SET NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 CHECK (ends_at IS NULL OR starts_at IS NULL OR ends_at > starts_at)
);
CREATE INDEX IF NOT EXISTS simatu_platform_ads_delivery_idx ON public.simatu_platform_ads(placement,status,priority DESC,starts_at,ends_at);
ALTER TABLE public.simatu_platform_ads ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.simatu_platform_ads FROM anon, authenticated;
