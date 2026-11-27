BEGIN;
CREATE TABLE public.marketplace_discovery_tiles (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 marketplace_category_id UUID NOT NULL REFERENCES public.marketplace_categories(id) ON DELETE RESTRICT,
 title TEXT NOT NULL,
 image_url TEXT NOT NULL,
 alt_text TEXT NOT NULL,
 subtitle TEXT,
 destination_path TEXT NOT NULL,
 sort_order INTEGER NOT NULL DEFAULT 0,
 is_active BOOLEAN NOT NULL DEFAULT TRUE,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 CONSTRAINT marketplace_discovery_tiles_title_valid CHECK (length(title) BETWEEN 1 AND 120 AND title=trim(title)),
 CONSTRAINT marketplace_discovery_tiles_image_valid CHECK (image_url ~ '^https?://'),
 CONSTRAINT marketplace_discovery_tiles_alt_valid CHECK (length(alt_text) BETWEEN 1 AND 250),
 CONSTRAINT marketplace_discovery_tiles_destination_valid CHECK (destination_path LIKE '/discover/%'),
 CONSTRAINT marketplace_discovery_tiles_order_valid CHECK (sort_order >= 0),
 UNIQUE(marketplace_category_id)
);
CREATE INDEX marketplace_discovery_tiles_active_order_idx ON public.marketplace_discovery_tiles(is_active,sort_order);
ALTER TABLE public.marketplace_discovery_tiles ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.marketplace_discovery_tiles FROM PUBLIC, anon, authenticated;
COMMIT;