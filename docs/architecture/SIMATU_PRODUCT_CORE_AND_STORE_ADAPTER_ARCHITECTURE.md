# Simatu Product Core and Store Adapter Architecture

**Status:** Owner-directed architecture and migration work in progress  
**Workspace:** `codex/simatu-work`  
**Scope:** Platform product definition, store adapters, Marketplace participation, inventory, storefronts, and commerce  
**Rule:** This document is the canonical direction for unwiring store-owned product definitions. It does not certify that the target model is implemented.

## 1. Architectural decision

Simatu owns the canonical product definition. A store is a business and sales channel that adapts a Simatu product; it must not define the platform's product structure. Marketplace is a governed participation and fulfilment channel, not a second product definition or a boolean on the product form.

The platform must separate:

- **Product identity and definition** — Simatu-owned, independent of any store.
- **Business association/ownership** — who originated or owns the product and who may manage it.
- **Store listing** — store-specific selling configuration, merchandising, pricing, and storefront publication.
- **Marketplace participation** — eligibility, subscription/business requirements, request/submission, approval, stock delivery, receiving, verification, and publishing.
- **Inventory** — stock position, reservations, movements, and location, with explicit owner/channel custody.
- **Commerce** — cart, order, payment, fulfilment, cancellation, refund, and transaction snapshots.

Do not collapse these responsibilities into one product row or one visibility flag.

## 2. Canonical product definition

The platform product core should hold the information that defines the item, without requiring a store slug:

- Stable platform product ID
- Name and product type
- SKU/identifiers, subject to a defined uniqueness policy
- Description and structured product attributes
- Simatu-owned category and subcategory
- Product media and ordering
- Variants/options and their identifiers
- Product lifecycle/status and audit timestamps
- Origin/ownership/business references as separate relationships, not as schema authority
- Links to channel-specific records (store listing, Marketplace participation) rather than channel booleans as the product definition

The exact table design and SKU uniqueness scope must be determined by schema and consumer audit before migration. Service offerings are a distinct domain and must not be forced into a physical retail-product model.

## 3. Store adapter responsibilities

Stores consume the canonical product core and may provide their own configuration where appropriate:

- Store association and permitted product use
- Store-specific selling price, promotions, and commercial rules
- Store listing/publication status
- Store-specific presentation overrides (only where explicitly supported)
- Store navigation and category display order
- Store inventory references and operational configuration

Store category structures must not dictate Simatu's shared product classification. Store navigation is presentation only. A store cannot change a platform product's core identity or attributes by virtue of a listing.

Storefront visibility should use the listing's publication/status rules and the existing product status semantics. Do not add a redundant product-form visibility checkbox.

## 4. Marketplace participation lifecycle

Marketplace is a channel/workflow. It is not a checkbox in the product-definition form.

A participation record should represent the relationship between a product and Marketplace, including the governed stages and history. Stage names and transitions are to be reconciled with the previously agreed business workflow before implementation. The workflow must support relevant business/subscription eligibility, request/submission, review, stock delivery, receiving, verification, acceptance/rejection, inventory custody, and publishing. Receiving and verification cannot be bypassed by a generic admin approval.

Marketplace participation must not automatically change a store listing or store inventory. Channel and inventory transitions must be explicit, validated, and auditable.

## 5. Current implementation findings (initial audit)

These findings are based on inspected source on `codex/simatu-work`; the full dependency audit is still in progress.

### Legacy store-owned product path

- `src/features/admin/components/product-form/types.ts` defines `AdminProduct` with `storefront`, store category/subcategory IDs and labels, and legacy channel booleans.
- `AdminProductForm.tsx` uses `useProductCategories`, which loads categories in store scope, and `useProductDraft`, which forces/normalizes the product to a store slug.
- `useProductDraft.ts` has `applyStorefront`, making store identity part of product form hydration.
- `useProductFormSubmit.ts` posts to `/api/products` and serializes the store-owned category fields and legacy visibility flags.
- `netlify/functions/products.mjs` authenticates admins, requires or enforces a storefront, resolves category/subcategory within the selected store, and writes the legacy `public.products` path. Store-admin scope is enforced against the store slug.
- `src/systems/storefront/core/hooks/useProducts.ts` fetches products by storefront from `/api/products?storefront=...` and uses legacy fields such as `category`, `subcategory`, `is_active`, and `sort_order` for storefront discovery.
- `src/systems/storefront/core/types/storefront.ts` defines store-specific category order, navigation and collection configuration.

### Parallel platform-owned catalogue path

- `public.marketplace_products` is currently a separate store-independent product table with its own variants and attribute values.
- This independent Marketplace catalogue does not yet establish a single canonical product core used by the legacy store product form/API/storefront.
- The existing `marketplace_products` model includes `marketplace_visible` and `is_active`; channel visibility and Marketplace participation lifecycle must be audited and redesigned rather than carried forward as the governing model.

### Immediate risks

- Two product systems can drift in identity, fields, validation, variants, pricing, media and status.
- The legacy store product form/API requires store context and store taxonomy, so it cannot create a platform product independently.
- Store category IDs/labels are still serialized in the legacy product API and consumed by store discovery.
- Marketplace independent products are not automatically connected to legacy product identity, store listings, inventory, carts, or orders.
- Removing legacy dependencies prematurely could break product management, storefront rendering, POS, inventory, historical order records, or checkout.

## 6. Unwiring principles

1. Do not delete legacy product records, schemas, columns, IDs, hooks, APIs, or backups during the migration.
2. Do not create a second competing canonical product core.
3. Do not allow store category IDs to define platform classification.
4. Do not require a store slug to create or define a platform product.
5. Do not equate product active status with Marketplace approval/eligibility.
6. Do not add product-form checkboxes for storefront or Marketplace visibility.
7. Preserve product, variant, SKU, inventory, media, order and historical references.
8. Backend validation and authorization must enforce ownership and channel transitions.
9. Store adapters may only override fields explicitly permitted by platform policy.
10. Keep physical products and service offerings in appropriate domain models.
11. Do not run or apply database migrations automatically. Database changes require review and user-run execution.
12. Do not merge this work into protected branches.

## 7. Implementation stages

### Stage A — Dependency audit (in progress)

Map every legacy product field, API endpoint, hook, form, database constraint, store consumer, POS, inventory, order, cart, checkout, marketplace discovery and Admin consumer. Classify each dependency as core definition, store adapter, channel workflow, inventory, commerce, historical compatibility, or candidate for retirement. Identify tests and migration hazards.

### Stage B — Canonical core and contract

Define a typed platform product contract, ownership and permission rules, identifiers, variants/attributes/media, category contract, lifecycle, and relationships. Confirm database target schema from actual migrations and data before designing changes.

### Stage C — API boundary

Establish platform product create/read/update APIs that do not require storefront context. Store adapters must use explicit association/listing endpoints. Marketplace participation must use a separate lifecycle endpoint. Keep legacy `/api/products` compatibility during transition.

### Stage D — Store adapter migration

Migrate Admin product management and store consumers to the canonical core plus explicit store listing. Remove store-owned taxonomy from core product form. Preserve store category ordering/navigation as presentation config only. Keep store-scoped authorization and commercial configuration.

### Stage E — Channel and inventory integration

Connect Marketplace participation and receiving/verification to inventory custody. Integrate store listings and Marketplace with cart/order/checkout without conflating channel stock. Ensure status, eligibility, publication, stock, pricing and ownership checks are server enforced.

### Stage F — Data migration and dual-read/verification

Plan idempotent mapping and preserve IDs or explicit crosswalks. Compare counts and references. Use compatibility reads or dual-read only as a controlled temporary measure. Do not cut over until product, variant, SKU, media, inventory, order and storefront journeys are validated.

### Stage G — Retirement

Only after consumers have migrated and tests pass, retire legacy store-owned product definitions and redundant fields/endpoints. Retirement requires an explicit, reviewed removal list and migration evidence.

## 8. Required audit inventory

The dependency audit must include:

- Product form and draft hydration
- Admin product CRUD/list/status actions
- Product API validation, GET/POST/PATCH/DELETE, authorization, category lookup
- Database `public.products`, `marketplace_products`, category tables, variants, attribute engine, media/storage
- Storefront product fetch, filtering, category/subcategory, sorting, caching, detail and cart
- Marketplace discovery, eligibility and participation workflow
- Inventory, POS/direct sale, stock movement and receiving
- Cart, checkout, order snapshots, fulfilment, refunds and cancellation
- Reporting/analytics and product references
- Seed scripts and fixtures
- Unit, API, integration and end-to-end tests
- RLS, permissions, foreign keys, indexes, uniqueness and migration history

## 9. Acceptance criteria

The unwiring is complete only when:

- Simatu can define a product without a store slug.
- Product identity and platform classification are store-independent.
- A store can be associated through an explicit adapter/listing relationship without redefining the core.
- Store category/navigation configuration cannot alter platform taxonomy.
- Store-specific price, listing, and stock remain correctly scoped.
- Marketplace participation is an explicit lifecycle with eligibility and audited transitions, not a checkbox.
- Marketplace receiving/verification/stock custody is enforced before eligible publishing where required.
- Product, variant, media, inventory, order and historical references remain intact.
- Admin, storefront, POS, cart, checkout, Marketplace, and reporting use the agreed model.
- Legacy records remain recoverable until migration validation is complete.
- Automated checks and end-to-end flows pass; unverified items are explicitly reported.

## 10. Change control

This architecture is an owner-directed change on `codex/simatu-work`. It is not authorization to create branches, merge, deploy, apply migrations, modify protected branches, or remove existing records. Each database migration must be reviewed and run by the repository owner in the intended environment.
