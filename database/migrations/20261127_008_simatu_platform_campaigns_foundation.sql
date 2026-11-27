-- Simatu-owned platform campaign records. Store campaigns remain in their separate domain.
CREATE TABLE IF NOT EXISTS public.simatu_platform_campaigns (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 name text NOT NULL CHECK(length(trim(name)) BETWEEN 2 AND 160),
 description text NOT NULL DEFAULT '',
 objective text NOT NULL CHECK(objective IN ('awareness','traffic','engagement','sales','conversions')),
 status text NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','scheduled','active','paused','completed','cancelled','archived')),
 starts_at timestamptz,
 ends_at timestamptz,
 budget_cents bigint CHECK(budget_cents IS NULL OR budget_cents>=0),
 image_url text,
 sort_order integer NOT NULL DEFAULT 0 CHECK(sort_order>=0),
 metadata jsonb NOT NULL DEFAULT '{}'::jsonb CHECK(jsonb_typeof(metadata)='object'),
 created_by uuid REFERENCES public.admins(id) ON DELETE SET NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 CHECK(ends_at IS NULL OR starts_at IS NULL OR ends_at>starts_at)
);
CREATE INDEX IF NOT EXISTS simatu_platform_campaigns_status_dates_idx ON public.simatu_platform_campaigns(status,starts_at,ends_at);
ALTER TABLE public.simatu_platform_campaigns ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.simatu_platform_campaigns FROM PUBLIC,anon,authenticated;
COMMENT ON TABLE public.simatu_platform_campaigns IS 'Simatu-owned platform campaigns independent of stores.';
