ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS checkout_group_id UUID;

CREATE INDEX IF NOT EXISTS idx_orders_checkout_group_id
  ON public.orders (checkout_group_id);
