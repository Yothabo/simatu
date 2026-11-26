-- Simatu commercial ecosystem foundation
-- Organic discovery remains independent from paid promotion.
CREATE TABLE IF NOT EXISTS public.simatu_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (length(trim(name)) BETWEEN 2 AND 120),
  campaign_type text NOT NULL CHECK (campaign_type IN ('product_boost','category_sponsor','store_feature','seasonal')),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','scheduled','active','paused','completed','cancelled')),
  starts_at timestamptz,
  ends_at timestamptz,
  budget_cents bigint CHECK (budget_cents IS NULL OR budget_cents >= 0),
  target_category_slug text,
  created_by uuid REFERENCES public.admins(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at IS NULL OR starts_at IS NULL OR ends_at > starts_at)
);
CREATE TABLE IF NOT EXISTS public.simatu_campaign_products (
  campaign_id uuid NOT NULL REFERENCES public.simatu_campaigns(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  PRIMARY KEY (campaign_id, product_id)
);
CREATE TABLE IF NOT EXISTS public.simatu_promotion_events (
  id bigserial PRIMARY KEY,
  campaign_id uuid REFERENCES public.simatu_campaigns(id) ON DELETE SET NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  store_id uuid REFERENCES public.stores(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('impression','click','add_to_cart','purchase')),
  visitor_key text,
  order_id uuid,
  occurred_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS simatu_campaigns_store_status_idx ON public.simatu_campaigns(store_id,status);
CREATE INDEX IF NOT EXISTS simatu_campaigns_active_idx ON public.simatu_campaigns(status,starts_at,ends_at);
CREATE INDEX IF NOT EXISTS simatu_promotion_events_campaign_date_idx ON public.simatu_promotion_events(campaign_id,occurred_at);
CREATE INDEX IF NOT EXISTS simatu_promotion_events_store_date_idx ON public.simatu_promotion_events(store_id,occurred_at);
CREATE TABLE IF NOT EXISTS public.simatu_subscription_plans (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  monthly_price_cents bigint NOT NULL CHECK (monthly_price_cents >= 0),
  features jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.simatu_subscription_plans (id,name,description,monthly_price_cents,features,is_active)
VALUES
 ('free','Free','Organic marketplace access and core store tools.',0,'{"analytics":"basic","campaigns":false,"promotions":false,"intelligence":"basic"}',true),
 ('growth','Growth','Marketing and advanced store insights.',0,'{"analytics":"advanced","campaigns":true,"promotions":true,"intelligence":"growth"}',false),
 ('professional','Professional','Advanced growth intelligence and campaign tooling.',0,'{"analytics":"advanced","campaigns":true,"promotions":true,"intelligence":"advanced"}',false)
ON CONFLICT (id) DO NOTHING;
CREATE TABLE IF NOT EXISTS public.simatu_store_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  plan_id text NOT NULL REFERENCES public.simatu_subscription_plans(id),
  status text NOT NULL DEFAULT 'trial' CHECK (status IN ('trial','active','past_due','cancelled','expired')),
  started_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz,
  external_billing_reference text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS simatu_store_subscriptions_store_idx ON public.simatu_store_subscriptions(store_id,status);
CREATE TABLE IF NOT EXISTS public.simatu_commission_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  storefront text,
  category_slug text,
  commission_basis_points integer NOT NULL CHECK (commission_basis_points BETWEEN 0 AND 10000),
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at IS NULL OR ends_at > starts_at)
);
CREATE TABLE IF NOT EXISTS public.simatu_commission_ledger (
  id bigserial PRIMARY KEY,
  order_id uuid,
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  gross_amount_cents bigint NOT NULL CHECK (gross_amount_cents >= 0),
  commission_basis_points integer NOT NULL CHECK (commission_basis_points BETWEEN 0 AND 10000),
  commission_amount_cents bigint NOT NULL CHECK (commission_amount_cents >= 0),
  currency text NOT NULL DEFAULT 'ZAR',
  status text NOT NULL DEFAULT 'estimated' CHECK (status IN ('estimated','earned','reversed')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS simatu_commission_ledger_store_idx ON public.simatu_commission_ledger(store_id,created_at);
