# Product Core Persistence Transition — Implementation Plan

**Branch:** `codex/simatu-work`
**Status:** Store Listing persistence foundation created; migration remains unapplied and no data migration has been executed.

## Decision

Do not create a third competing product identity table. The existing `public.marketplace_products` is the candidate to evolve into canonical Simatu Product Core, but it currently mixes identity with channel/commercial fields. The existing `public.products` table is legacy store-owned catalogue infrastructure; it will not dictate the new architecture.

No legacy product crosswalk or automatic identity matching will be introduced. We are designing the new model cleanly. Legacy consumers will be retired or replaced according to the transition plan, not kept alive by new mapping infrastructure.

## Verified table/API constraints

The current independent Marketplace schema includes:
- `marketplace_products`: name, SKU, description, price, supplier cost, image URL, platform category/subcategory, active/visible flags, sort order, source and timestamps.
- `marketplace_product_variants`: product FK, SKU, name, price, supplier cost, options, active/sort order.
- `marketplace_product_attribute_values`: Marketplace product FK, attribute-definition FK and JSON value.
- Product attribute definitions have a marketplace scope/owner in addition to system, store and legacy product scopes.

The Marketplace API and order system directly depend on these table/column semantics today. Marketplace order items retain a restrictive FK to Marketplace products and price/name/SKU snapshots. Existing products API writes store-owned `public.products` records and resolves store category/subcategory within a store.

## Target logical model

1. **Product Core:** Simatu-owned canonical identity, descriptive content, shared taxonomy, governed attributes, media, variants. No store ownership, store price, or channel publication flags.
2. **Store Listings:** Separate store-to-core-product association, store price/compare-at price, listing lifecycle, presentation overrides, and store merchandising/navigation metadata.
3. **Marketplace Participation:** Independent eligibility, subscription/participation, submission, verification/approval, receiving/stock/custody and publishing lifecycle—not a product visibility boolean.
4. **Inventory:** Stock, reservations, movements, receiving and custody separate from product identity.
5. **Commerce:** Cart, checkout, orders, refunds and immutable historical snapshots.

## Transition strategy

### Stage 0 — compatibility and evidence (current)
- Trace consumers, FK, triggers, RLS/grants, unique constraints and indexes across the legacy and Marketplace product systems.
- Audit variants, media, inventory, POS, storefront, Marketplace checkout, refunds, analytics and historical order consumers.
- Establish backup/rollback and validation counts before any migration.
- Do not create legacy-to-core mapping/crosswalk tables or match products by name/SKU.

### Stage 1 — clean core and listing persistence
- Evolve/reuse the independent product identity only after schema audit.
- Preserve existing Marketplace API response compatibility while decoupling core identity from commercial/channel fields.
- Keep legacy `public.products` available only as needed for current compatibility; do not expand its role.
- Build Store Listing persistence as a distinct association that references canonical core product identity. Do not move, match, copy or delete legacy product data as part of its foundation.
- No automatic destructive cleanup.

### Stage 2 — new platform product API
- Introduce platform product CRUD that does not require a storefront or store category.
- Only platform-authorized roles may create/edit product core. Store admins must not gain cross-store/core privileges.
- Store listing CRUD is a separate endpoint/service with explicit store authorization.
- Validate canonical taxonomy, variants and governed attributes transactionally.
- Marketplace participation uses separate lifecycle actions, not product visibility.

### Stage 3 — Admin form cutover
- Product creation/edit targets Product Core: identity, description, shared category/subcategory, attributes, variants and media.
- Store selection, price, listing status and navigation move to a separate Store Listing workflow.
- Remove legacy store-category validation from core submission as the new API is implemented.
- Legacy UI/API compatibility is not a reason to add crosswalk infrastructure.

### Stage 4 — consumer adapters
Move consumers individually with tests and rollback:
- Admin list/details
- Storefront listing and search/category filtering
- POS lookup
- Inventory/receiving/variant movement
- Marketplace catalogue/participation
- Cart, checkout, order, refunds
- Analytics/reporting

### Stage 5 — retirement gate
Legacy store-owned product fields/API may be retired only after consumers are replaced, historical records remain safely accessible, and explicit retirement approval is granted.

## Validation gates

Before any owner-applied SQL migration:
- schema/FK inventory reviewed;
- counts captured for legacy/core/variants/media/attributes/listings/orders/inventory;
- SKU scope and collisions understood without auto-matching;
- taxonomy reviewed;
- RLS, role authorization and API tests pass;
- compatibility smoke tests pass;
- rollback/forward-repair instructions reviewed.

## Explicitly not done
- No schema migration created or applied as part of this transition.
- No data copied, re-keyed, matched or deleted.
- No endpoint cutover.
- No Admin/storefront/POS/inventory/Marketplace consumer switched.
- No build or test run is claimed.
