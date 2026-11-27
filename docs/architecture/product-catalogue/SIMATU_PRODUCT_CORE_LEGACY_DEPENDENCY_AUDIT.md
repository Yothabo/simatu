# Simatu Product Core — Legacy Dependency Audit

**Workspace:** `codex/simatu-work`  
**Audit status:** Initial source inspection completed; dependency tracing and data-level verification remain open.  
**Related architecture:** `SIMATU_PRODUCT_CORE_AND_STORE_ADAPTER_ARCHITECTURE.md`

## Audit objective

Find and classify the legacy store dependencies that currently define, persist, validate, fetch, display, transact, or report products. This audit informs a controlled migration to a Simatu-owned product core and store adapters. No database migration is applied by this audit.

## 1. Confirmed architectural split

| System | Current role | Target disposition |
|---|---|---|
| `public.products` / `/api/products` | Store-scoped legacy product CRUD and store category resolution | Compatibility boundary during migration; consumers progressively move off store-owned core definition |
| `public.marketplace_products` | Separate store-independent Marketplace product catalogue | Assess as a source for the canonical core or migration; avoid creating a third product identity |
| Store categories/subcategories | Product validation, Admin form and storefront filtering | Remove from core product definition; retain store navigation/display configuration only |
| Marketplace categories/subcategories | Simatu shared product classification | Canonical platform taxonomy |
| Storefront configuration | Store-specific category order, sections, navigation, presentation | Keep as adapter/presentation configuration |
| Store inventory | Store-scoped inventory operations | Preserve store/custody scope; connect to canonical product/variant IDs |
| Orders and historical records | Existing transaction references | Preserve references and snapshots; migrate only with mapping and validation |

## 2. Confirmed source dependencies

### Product definition and Admin

- `src/features/admin/components/product-form/types.ts`: `AdminProduct` includes storefront slug, store category/subcategory names and IDs, marketplace category/subcategory fields, status, and storefront/marketplace visibility booleans.
- `src/features/admin/components/AdminProductForm.tsx`: uses `useProductCategories`, `useProductDraft`, `useProductFormSubmit`, and `useMarketplaceTaxonomy`. The form's category flow is still connected to store category options and draft hydration.
- `src/features/admin/components/product-form/hooks/useProductDraft.ts`: `applyStorefront` forces a store slug for the product draft, including defaulting super-admin drafts to a store.
- `src/features/admin/components/product-form/hooks/useProductFormSubmit.ts`: validates legacy store category/subcategory, serializes storefront and legacy category fields, and sends to `/api/products`. This is a key unwiring target.
- `src/features/admin/components/product-form/hooks/useProductCategories.ts`: store category loader/selector path; trace callers and behavior before replacement.
- `src/features/admin/components/product-form/hooks/useMarketplaceTaxonomy.ts`: shared Simatu taxonomy already exists; this should be the platform classification source after core migration.
- `src/features/admin/components/product-form/components/ProductFormFields.tsx`: current UI contains the Simatu shared Category/Subcategory fields, plus description, sizes and image; store visibility and Marketplace checkboxes were removed. Confirm remaining identity/pricing components and validation before altering the form further.

### API

- `netlify/functions/products.mjs`: legacy product endpoint requires/enforces storefront context. For store admins it restricts to their store slug. For updates it queries existing products by ID and store scope, then resolves category/subcategory within the effective storefront. It writes the legacy `public.products` model. This API must be separated into platform product operations and explicit store listing operations, while retaining a compatibility adapter during transition.
- `netlify/functions/marketplace-products.mjs`: separate Marketplace API and table. Inspect authorization, category/attribute/variant validation, data shape and transaction behavior before deciding whether to adopt or migrate it into the canonical product core.
- `src/features/admin/hooks/admin-products/useProductsApi.ts`: Admin calls `/api/products`, with a distinct admin scope query. Replace only after the new API contract and adapter are in place.

### Storefront consumers

- `src/systems/storefront/core/hooks/useProducts.ts`: fetches `/api/products?storefront=...`, caches results keyed by storefront, and models fields such as category/subcategory, `is_active`, sort order and order count. Storefronts currently depend on the legacy product response shape.
- `src/systems/storefront/core/types/storefront.ts`: storefront configuration defines category order, catalogue navigation, category labels/aliases, collections and category-based presentation. These are adapter/presentation concerns and should not be deleted; ensure they are no longer the platform taxonomy authority.

## 3. Current form/API coupling

The legacy product form is currently unable to define a platform product without a storefront because:

1. The draft contract includes a required `storefront`.
2. Draft hydration assigns or defaults a storefront.
3. Store category options are loaded in the selected store context.
4. Submit validation requires store category and subcategory IDs.
5. Submit payload includes storefront, store category IDs/labels and legacy visibility flags.
6. The API requires storefront context and resolves category references against that store.

The intended future form creates a platform product core with Simatu category/subcategory and product attributes. Store listing, store price/publication, inventory and Marketplace participation become separate workflows.

## 4. Risks and safeguards

- **Product identity:** legacy and Marketplace products may represent the same item but have different IDs. Establish an explicit mapping; do not infer matches from name/SKU alone.
- **Variants/SKUs:** preserve all current parent/variant/SKU relationships and uniqueness scope.
- **Pricing:** store prices are commercial listing data. Do not overwrite them with shared product-core values.
- **Inventory:** keep quantities, reservations and movement histories in their correct store or Marketplace custody scope.
- **Orders:** preserve transaction snapshots and existing product IDs. Historical orders must not depend on a product being rewritten or deleted.
- **Media:** preserve storage paths and image references during data migration.
- **Classification:** store category IDs are not Simatu taxonomy IDs. Build explicit mapping and validation; don't use name matching as a silent migration.
- **Authorization:** moving to platform-level product creation must not accidentally broaden store-admin access or allow cross-store edits.
- **Visibility:** remove redundant product-level checkboxes from the form, but do not remove database/API fields until their consumers and semantics are understood.
- **Availability:** active product, store listing published, Marketplace eligible, Marketplace accepted stock and channel stock available are distinct states.
- **Services:** Yotaabo services/bookings are not physical retail products and require their own domain entity and lifecycle.

## 5. Dependency inventory to trace next

This is a required audit queue, not an assertion that every item is currently store-coupled:

- [ ] Product validation `netlify/functions/_shared/product-validation.mjs`
- [ ] Legacy product endpoint GET/POST/PATCH/DELETE and admin-scope behavior
- [ ] Admin product list, table, category filters, product status actions and caching
- [ ] Product form state, draft storage, category hooks, image upload and submission
- [ ] Product details modal and data normalization
- [ ] Storefront fetch/filter/category/search/sort/collection/detail/cart
- [ ] Store-specific seed/import scripts
- [ ] POS and direct-sale product lookup
- [ ] Inventory, variant inventory, receiving and movement records
- [ ] Marketplace product API and independent product/variant/attribute tables
- [ ] Cart, checkout, order creation, order snapshots, refunds and cancellation
- [ ] Analytics/reporting and historical product references
- [ ] RLS, grants, triggers, constraints, indexes and category relationships
- [ ] Unit, API, integration and E2E tests and fixtures

## 6. Next implementation steps

1. Finish tracing dependencies and schemas; capture exact field and reference use.
2. Finalize canonical platform product contract and channel/listing contracts.
3. Implement platform product API without requiring a store.
4. Build explicit store listing association and store-scoped commercial configuration.
5. Migrate Admin form to platform product creation; remove store category dependency from core definition.
6. Adapt storefront, Admin, inventory, POS, Marketplace and commerce consumers in controlled slices.
7. Create reviewed migration scripts and verification queries; do not execute them automatically.
8. Retire legacy store-owned product fields/endpoints only after validation and explicit retirement approval.

## 7. Audit completion requirements

Do not claim the product system is fully unwired until the inventory above has been traced, schema/reference mapping is complete, migrated consumers are tested, and the legacy model can be retired safely. This document records confirmed findings and outstanding work; it is not a migration completion certificate.
