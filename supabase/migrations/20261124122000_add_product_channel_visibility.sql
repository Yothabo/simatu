ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS marketplace_visible BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS storefront_visible BOOLEAN NOT NULL DEFAULT TRUE;

COMMENT ON COLUMN public.products.marketplace_visible IS
  'Whether this product is discoverable and purchasable through the shared Simatu marketplace.';

COMMENT ON COLUMN public.products.storefront_visible IS
  'Whether this product is discoverable through its owning storefront.';
