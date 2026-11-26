BEGIN;

CREATE TABLE IF NOT EXISTS public.marketplace_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL CHECK (length(trim(customer_name)) BETWEEN 2 AND 120),
  customer_phone TEXT NOT NULL CHECK (length(trim(customer_phone)) BETWEEN 7 AND 15),
  delivery_address TEXT NOT NULL DEFAULT '',
  subtotal NUMERIC(12,2) NOT NULL CHECK (subtotal >= 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','processing','shipped','delivered','cancelled')),
  payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid','pending','paid','failed','refunded')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.marketplace_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.marketplace_orders(id) ON DELETE CASCADE,
  marketplace_product_id UUID NOT NULL REFERENCES public.marketplace_products(id) ON DELETE RESTRICT,
  marketplace_variant_id UUID REFERENCES public.marketplace_product_variants(id) ON DELETE RESTRICT,
  product_name TEXT NOT NULL,
  variant_name TEXT NOT NULL DEFAULT '',
  sku TEXT NOT NULL,
  unit_price NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
  quantity INTEGER NOT NULL CHECK (quantity BETWEEN 1 AND 20),
  line_total NUMERIC(12,2) NOT NULL CHECK (line_total >= 0),
  options JSONB NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(options) = 'object'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS marketplace_orders_created_idx
  ON public.marketplace_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS marketplace_order_items_order_idx
  ON public.marketplace_order_items(order_id);

ALTER TABLE public.marketplace_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_order_items ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.marketplace_orders FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.marketplace_order_items FROM PUBLIC, anon, authenticated;

COMMENT ON TABLE public.marketplace_orders IS
  'Customer orders for Simatu-owned independent marketplace products.';
COMMENT ON TABLE public.marketplace_order_items IS
  'Price snapshots and variant selections for marketplace order lines.';

COMMIT;
