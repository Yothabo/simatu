# Product Core Persistence Transition — Implementation Plan

**Branch:** `codex/simatu-work`
**Status:** Design gate; no schema changes or data migration executed.

## Decision

Do not create a third competing product identity table. The existing `public.marketplace_products` is store-independent and is the strongest candidate for evolving into the canonical Simatu product core, but it currently mixes core identity with channel/commercial fields. The existing `public.products` table remains a legacy store-owned catalogue and must stay available as a compatibility source while consumers are migrated.

## Verified table/API constraints

The current independent Marketplace schema includes:
- `marketplace_products`: name, SKU, description, price, supplier cost, image URL, platform category/subcategory, active/visible flags, sort order, source and timestamps.
- `marketplace_product_variants`: product FK, SKU, name, price, supplier cost, options, active/sort order.
- `marketplace_product_attribute_values`: Marketplace product FK, attribute-definition FK and JSON value.
- Product attribute definitions have a marketplace scope/owner in addition to system, store and legacy product scopes.

The Marketplace API and order system directly depend on these table/column semantics today. Marketplace order items retain a restrictive FK to Marketplace products and price/name/SKU snapshots. Existing products API writes the store-owned `public.products` records, resolving store category and subcategory within a store.

## Target logical model (no premature table design)

1. **Product core:** Simatu-owned identity, descriptive content, shared platform taxonomy, governed attributes, media, and product variants. No store owner, store price, or channel publication flags.
2. **Store listing:** explicit store-to-product association, listing state, store price/compare-at price, presentation overrides, store sort/navigation metadata. Listing lifecycle is independent from core status.
3. **Marketplace participation:** separate lifecycle/eligibility/submission/approval and stock/custody states. It is not a product boolean.
4. **Inventory:** store/custody/variant-scoped quantities, movements, reservations and receiving. Inventory is not product identity.
5. **Commerce:** order lines retain immutable product/variant, SKU, description and price snapshots and existing historical references.

## Transition strategy

### Stage 0 — compatibility and evidence (current)
- Trace every consumer, FK, trigger, RLS/grant, unique constraint and index of both product models.
- Establish an explicit legacy-product-to-core/listing mapping table design. Never match solely by product name or SKU.
- Verify product variants, media, inventory, POS, storefront, Marketplace checkout, refunds, analytics and historical order consumers.
- Establish backup/rollback and validation counts before migration.

### Stage 1 — additive core compatibility
- Evolve/reuse the independent product identity only after the full schema audit.
- Preserve Marketplace API response fields using a compatibility projection; existing Marketplace listing/order behavior must continue.
- Keep current `public.products` reads/writes operational during transition.
- Add a stable crosswalk from each legacy product ID to the canonical core ID and store-listing ID. Mapping must be explicit, unique and auditable.
- Add the store listing layer without moving/deleting legacy data. No automatic destructive cleanup.

### Stage 2 — new platform product API
- Introduce platform product CRUD that does not require a storefront or store category.
- Authorization: only platform-authorized roles may create/edit product core. Store admins must not gain cross-store or core-edit privileges by virtue of the new endpoint.
- Store listing CRUD is a separate endpoint/service with explicit store authorization.
- API writes should validate canonical taxonomy, variants and governed attributes in a transaction.
- Marketplace participation requests are separate lifecycle actions, not a visibility flag.

### Stage 3 — Admin form cutover
- Admin product creation/edit targets product core only: name, SKU/identity rules, description, shared category/subcategory, attributes, variants and media.
- Store selection, price, listing status and navigation are moved to a separate listing workflow.
- Remove legacy store-category validation from product-core submission only after the new API and crosswalk exist.
- Preserve edit compatibility for legacy records until migrated and verified.

### Stage 4 — consumer adapters
Move consumers individually, with tests and rollback:
- Admin list/details
- storefront listing and search/category filtering
- POS lookup
- inventory/receiving/variant movement
- Marketplace catalogue/participation
- cart, checkout, order, refunds
- analytics/reporting

### Stage 5 — retirement gate
Legacy store-owned product fields/API may be retired only after all consumers are migrated, crosswalk integrity is verified, historical records remain accessible, and a separate explicit retirement approval is granted.

## Migration validation gates

Before any owner-applied SQL migration:
- schema and FK inventory reviewed;
- counts captured for legacy/core/variants/media/attributes/listings/orders/inventory;
- all legacy products have either a verified mapping or a documented exception;
- no orphaned variant, inventory, cart, order or historical reference;
- unique SKU scope and SKU collisions resolved;
- category mapping reviewed (no silent label matching);
- RLS, role authorization and API tests pass;
- compatibility API smoke tests pass;
- rollback/forward-repair instructions reviewed.

## Explicitly not done

- No migration SQL created or applied.
- No data copied, re-keyed or deleted.
- No endpoint cutover.
- No Admin/storefront/POS/inventory/Marketplace consumer switched.
- No build or test run is claimed.
