-- Simatu-owned platform services, independent from store catalogues.
-- Additive foundation; apply manually after review.
CREATE TABLE IF NOT EXISTS public.simatu_platform_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (length(trim(name)) BETWEEN 2 AND 200),
  slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text NOT NULL DEFAULT '',
  category_slug text,
  image_url text,
  price_cents bigint CHECK (price_cents IS NULL OR price_cents >= 0),
  pricing_model text NOT NULL DEFAULT 'fixed' CHECK (pricing_model IN ('fixed','starting_at','quote','free')),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','paused','archived')),
  sort_order integer NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(metadata) = 'object'),
  created_by uuid REFERENCES public.admins(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS simatu_platform_services_status_order_idx
  ON public.simatu_platform_services(status, sort_order, created_at DESC);
ALTER TABLE public.simatu_platform_services ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.simatu_platform_services FROM PUBLIC, anon, authenticated;
COMMENT ON TABLE public.simatu_platform_services IS 'Simatu-owned services; independent from store listings and store product records.';
