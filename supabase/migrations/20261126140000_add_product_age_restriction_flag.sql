-- Restricted marketplace listings are server-classified and excluded from public
-- product discovery and order creation until a trusted age-verification flow exists.
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS is_age_restricted BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN public.products.is_age_restricted IS
  'Platform-controlled classification. Restricted products are excluded from public APIs and order creation; merchants cannot set this through product payloads.';
