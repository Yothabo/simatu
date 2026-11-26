# Simatu Marketplace & Storefront Experience Specification

**Status:** Architecture contract / implementation checklist  
**Scope:** Marketplace, private storefronts, offerings (products and services), shopping and booking coexistence, marketplace submission/receiving eligibility, transaction-context separation, and tracking.  
**Deferred:** Financial allocation/payouts, advanced delivery logistics, fulfilment orchestration.

## 1. Platform vision

Simatu is a multi-business platform offering two connected but distinct customer experiences:

- **Marketplace (Mood Board):** platform-wide discovery and transactions across businesses.
- **Private storefront:** a direct business-owned shopping and service experience.

One platform supports multiple businesses and transaction types without making those transaction types share one lifecycle. Customers can discover, purchase, book, reserve, request quotes, or order custom work as supported.

**Core principle:** One platform. Multiple businesses. Multiple ways to transact. Distinct experiences that work together without interfering with each other.

## 2. Marketplace / Mood Board

### Purpose
Marketplace discovery is not exclusively product-centric. It discovers businesses, products, services, and experiences.

### Platform-owned categories
Marketplace categories are defined and administered by Simatu, not created freely by individual businesses. Examples include Fashion, Beauty, Pets, Home & Living, Electronics, Automotive, Food & Groceries, Health & Wellness, Travel & Experiences, Professional Services, and Home Services.

Categories classify marketplace destinations/businesses. Industry-specific product attributes and offering types are separate taxonomy concerns. A business may be assigned to multiple marketplace categories without being duplicated.

### Dynamic discovery checklist
- [ ] Categories are centrally defined and configurable.
- [ ] Business-category assignment supports many-to-many.
- [ ] Discovery dynamically retrieves eligible businesses; no hardcoded business lists.
- [ ] Businesses/offers are filtered by active, approval, visibility, eligibility, and other applicable policies.
- [ ] Category changes do not require frontend code changes.
- [ ] New businesses become discoverable through configuration and eligibility, not code edits.
- [ ] Product and service discovery are both supported.

## 3. Business domain

A Business is the platform entity representing a retailer, service provider, professional, manufacturer, custom-order business, or hybrid.

Business owns identity, owners/permissions, profile, branding, locations, operational status, operating hours, catalogue/offerings, providers/staff, business policies, and private storefront configuration.

Business does **not** own marketplace category definitions or marketplace-wide discovery, and it does not own global booking, commerce, payment, or tracking infrastructure.

Checklist:
- [ ] Business identity/profile and ownership
- [ ] Locations and operating hours
- [ ] Business status and permissions
- [ ] Products, services, and other offerings
- [ ] Providers/resources where applicable
- [ ] Private storefront configuration
- [ ] Marketplace participation/eligibility relationship

## 4. Offering domain: redesign products and services

The existing product schema is not assumed to be the correct foundation. Redesign the domain rather than extending the old product model indefinitely or placing services beside it as a disconnected subsystem.

**Offering** provides common identity and customer-facing information (business owner, name, description, media, status, pricing presentation, policies, and visibility/context). Specialized domains retain their own rules:

- **Product:** purchase, variants, quantities, customization, stock, units, inventory, and fulfilment.
- **Service:** booking/request/reservation, providers, duration, locations/resources, capacity, availability, and service lifecycle.

Do not implement one giant nullable table or treat everything as a product with optional booking fields. Migration/data preservation is distinct from preserving the old schema semantics; existing data must be audited and migrated safely, never casually discarded.

### Product capabilities
- [ ] Product identity/type, description, media
- [ ] Pricing models and sale units
- [ ] Variants and option/customization choices
- [ ] Typed product attributes
- [ ] Custom/made-to-order products
- [ ] Physical/digital product support as applicable
- [ ] Inventory and stock status
- [ ] Marketplace and private storefront visibility/eligibility independently controlled
- [ ] Fulfilment configuration (experience/UI foundations now; orchestration later)

### Typed attribute engine
Attributes must be schema-defined, typed, and validated—not an unstructured dumping ground. Supported types should include text, number, boolean, single/multi-select, measurement, date, and structured values as justified.
Attribute definitions should be able to specify type, validation, required/default, units, customer-selectability, price effect, variant/inventory effect, searchable/filterable, and applicability.
- [ ] Attribute definitions and typed values
- [ ] Validation rules
- [ ] Required/default semantics
- [ ] Unit/measurement metadata
- [ ] Customer-selectable and price-affecting options
- [ ] Variant/inventory-defining attributes
- [ ] Search/filter metadata

### Custom measurement systems
Do not assume universal sizing. Support business-specific measurement profiles and units, e.g. custom footwear measurements (length, width, arch, circumference), weight, dimensions, volume, and domain-specific measurements.
- [ ] Measurement/unit definitions
- [ ] Business-defined profiles/labels where required
- [ ] Validation and conversions only where conversion is valid and defined

## 5. Service domain and booking

Services are not products with a booking field. They have their own configuration, availability, and lifecycle.

Supported booking patterns should be extensible: appointments, time slots, scheduled sessions, tours, group experiences, capacity-based, resource-based, location-based, mobile, request/approval, quote-based, and multi-day bookings.

### Service configuration checklist
- [ ] Service identity, description, media, and business ownership
- [ ] Duration and pricing model
- [ ] Providers/staff and qualifications where relevant
- [ ] Locations, resources, and capacity
- [ ] Schedules and availability
- [ ] Optional extras
- [ ] Deposits, cancellation, and booking policies
- [ ] Request/approval requirements
- [ ] Customer requirements
- [ ] Marketplace/storefront visibility

### Booking lifecycle
Booking lifecycle is independent of order lifecycle. Typical states may include draft, requested, held, confirmed, completed, cancelled, declined, expired, rescheduled, and no-show. Not every booking model needs every state; support policy-driven transitions without creating a bespoke booking system per business.
- [ ] Booking identity/context
- [ ] Availability validation and temporary holds where needed
- [ ] Booking confirmation and lifecycle
- [ ] Reschedule/cancel rules
- [ ] Expiry and conflict handling
- [ ] Participants/providers/resources

## 6. Marketplace shopping and booking coexistence

Customers may, in one marketplace session, purchase sneakers, groceries, pet food, book a massage, reserve a tour, or book another service. Product and booking selections must coexist and persist independently while customers continue browsing.

Checklist:
- [ ] Marketplace product basket and variants/quantities
- [ ] Marketplace service selection and booking details (provider, date/time, participants/options as applicable)
- [ ] Products and bookings coexist without overwriting one another
- [ ] More than one booking and business supported where rules permit
- [ ] Continue discovery after adding products or selecting bookings
- [ ] Clear visual distinction between purchase and reservation
- [ ] Marketplace selections cannot leak into private storefront context
- [ ] Product cart operations do not destroy booking selections
- [ ] Booking changes do not destroy product cart selections

Never force a service into the product cart as a stock item. A booking is not a product order, and a product cart must not control booking lifecycle.

## 7. Marketplace checkout orchestration

Marketplace checkout coordinates eligible product purchase intents and service booking intents in a coherent customer experience. It does not merge their underlying records or lifecycles.

Checkout may include products, variants, quantities, customization, and delivery requirements alongside services, providers, slots, locations, participants, booking requirements, and deposits as applicable.

Checklist:
- [ ] Separate products and bookings in review UI
- [ ] Item-level pricing and totals
- [ ] Validate product availability
- [ ] Revalidate booking availability before confirmation
- [ ] Expired/unavailable slot cannot be silently confirmed or charged as a completed booking
- [ ] Multi-business products/services supported as allowed
- [ ] Preserve domain transaction boundaries
- [ ] Idempotent submission / duplicate prevention
- [ ] Payment failure handling
- [ ] Booking failure handling
- [ ] Partial failure and recovery/compensation behavior
- [ ] Clear user-facing status and error feedback

**One checkout does not mean one order.** A checkout may coordinate a marketplace order, product suborders, separate service bookings, and a payment transaction. Payment coordination may be implemented as shared infrastructure; detailed allocation, payout, commissions, settlement, reconciliation, and delivery orchestration are deferred.

## 8. Marketplace submission, receiving, and eligibility

For physical products requiring Simatu marketplace stock, a business request or admin approval alone must not make the product purchasable. The business submits/request listing; Simatu receives stock, records quantities and discrepancies, verifies/approves, and activates eligibility. Only eligible marketplace stock can be made marketplace-purchasable.

Checklist:
- [ ] Business submission/request and status
- [ ] Submission review
- [ ] Physical stock receiving record
- [ ] Quantity and discrepancy recording
- [ ] Verification/approval
- [ ] Eligibility activation
- [ ] Marketplace stock/eligibility separated from private inventory
- [ ] Marketplace purchasability enforced by backend/API, not UI only
- [ ] Audit trail for receiving, verification, and eligibility actions

Marketplace eligibility and private storefront visibility are independent. Receiving and eligibility are separate auditable steps where appropriate. Warehouse/delivery operations beyond the required receiving gate are deferred.

## 9. Transaction contexts and tracking

Marketplace and private storefront transactions must have explicit, non-interchangeable context.

- Marketplace purchases and bookings are tracked in the Marketplace experience.
- Private storefront purchases and bookings are tracked within the relevant business storefront experience.
- Shared customer authentication does not collapse transaction context.

Checklist:
- [ ] Transaction context captured and validated
- [ ] Marketplace order/booking history and tracking
- [ ] Storefront-specific order/booking history and tracking
- [ ] Marketplace transactions do not appear as private-store transactions
- [ ] Private transactions do not appear as Marketplace transactions
- [ ] Context is preserved across checkout, confirmation, history, and tracking

## 10. Private storefront experience

Each business has an independent storefront with business-specific branding, navigation, catalogue, products, services, detail pages, options, policies, cart, checkout, booking context, order/booking history, and tracking.

Checklist:
- [ ] Independent branding/navigation
- [ ] Products and services supported
- [ ] Product details, variants/options/customization
- [ ] Service details and booking
- [ ] Store-specific cart and checkout context
- [ ] Store-specific booking context
- [ ] Store transaction/tracking experience
- [ ] Independent of marketplace participation/eligibility

Marketplace submission is not required for private storefront sales. Storefront availability does not automatically make an offering marketplace-eligible.

## 11. Business administration

Business admins can create/edit products, typed attributes, variants, custom measurements, pricing, private inventory and private storefront visibility; configure services, durations, options, providers, locations, resources, schedules, capacity, booking rules, and bookings; and submit products for marketplace participation.

- [ ] Product administration
- [ ] Variant/attribute/measurement configuration
- [ ] Service configuration and booking management
- [ ] Marketplace submission
- [ ] Submission, receiving, verification, and eligibility status visibility
- [ ] Cannot bypass marketplace receiving/eligibility rules

## 12. Platform administration

Simatu admins manage marketplace categories and policies, marketplace business approval, submissions, receiving, discrepancies, verification, eligibility, eligible inventory, and audit records.
- [ ] Category and hierarchy management
- [ ] Marketplace eligibility policy
- [ ] Business participation approval
- [ ] Product submission review
- [ ] Stock receiving and discrepancy recording
- [ ] Verification and eligibility activation
- [ ] Auditability and permission enforcement

Receiving, verification, and eligibility are distinct auditable actions where appropriate.

## 13. Domain ownership and boundaries

| Domain | Owns | Does not own |
|---|---|---|
| Marketplace | Discovery, category taxonomy, marketplace context, eligibility | Private storefront order lifecycle |
| Business | Business identity, locations, offerings, providers, storefront config | Marketplace taxonomy |
| Offering | Shared offering identity and presentation | Product/service-specific lifecycle |
| Product | Specs, attributes, variants, options, stock/sale semantics | Service booking lifecycle |
| Service | Service rules, provider/resource, availability, booking requirements | Product inventory lifecycle |
| Commerce | Product orders and order lifecycle | Booking availability/lifecycle |
| Booking | Reservations and booking lifecycle | Product order lifecycle |
| Marketplace tracking | Marketplace transaction experience | Private storefront transaction experience |
| Storefront tracking | Store-owned transaction experience | Marketplace transaction experience |
| Checkout orchestrator | Coordination and validation of transaction intents | Ownership of all underlying transactions |
| Payment engine | Payment processing and transaction records | Business/service lifecycle |

## 14. Implementation phases and checklist

Statuses are **Not started**, **In progress**, or **Complete**. Mark complete only after implementation and verification, not merely because a UI exists.

### Phase A — Core domain redesign
- [ ] Audit current schema and dependencies
- [ ] Business domain contracts
- [ ] Offering common identity
- [ ] Product domain redesign
- [ ] Service domain redesign
- [ ] Typed attribute engine
- [ ] Measurement/unit profiles
- [ ] Variants/options/customization
- [ ] Marketplace category and business assignment model
- [ ] Marketplace eligibility model
- [ ] Safe migration plan for existing data

### Phase B — Marketplace experience
- [ ] Platform category discovery
- [ ] Dynamic business retrieval
- [ ] Business listings
- [ ] Product/service/experience discovery
- [ ] Eligibility filtering
- [ ] Search and filters
- [ ] Category carousel/navigation
- [ ] Detail experiences
- [ ] Responsive and accessibility review

### Phase C — Private storefront experience
- [ ] Store product/service presentation
- [ ] Product/service detail experiences
- [ ] Customizations/options
- [ ] Store-specific cart
- [ ] Store-specific booking context
- [ ] Store checkout
- [ ] Store transaction history and tracking

### Phase D — Marketplace shopping and booking
- [ ] Marketplace basket
- [ ] Multi-business product selections
- [ ] Service bookings in marketplace session
- [ ] Product and booking coexistence/persistence
- [ ] Unified checkout review
- [ ] Transaction separation
- [ ] Availability revalidation and holds where required
- [ ] Payment coordination
- [ ] Failure handling/recovery
- [ ] Marketplace transaction history/tracking

### Phase E — Marketplace receiving and eligibility
- [ ] Business submission flow
- [ ] Submission status
- [ ] Receiving records
- [ ] Quantity/discrepancy recording
- [ ] Verification and approval
- [ ] Eligibility activation
- [ ] Marketplace stock visibility
- [ ] Audit history
- [ ] Backend/API enforcement tests

### Phase F — Admin experiences
- [ ] Business product management
- [ ] Business service management
- [ ] Booking management
- [ ] Marketplace submissions
- [ ] Platform category management
- [ ] Receiving/verification
- [ ] Eligibility management
- [ ] Permissions and audit

### Phase G — Deferred: fulfilment and logistics
- [ ] Marketplace fulfilment orchestration
- [ ] Simatu receiving/warehouse operations expansion
- [ ] Delivery routing and courier integration
- [ ] Marketplace delivery tracking
- [ ] Store delivery tracking
- [ ] Pickup/collection
- [ ] Dispatch and delivery status lifecycle
- [ ] Returns
- [ ] Marketplace/private fulfilment separation

### Phase H — Deferred: allocation and settlement
- [ ] Marketplace fund allocation
- [ ] Seller/provider allocation
- [ ] Commission and platform fees
- [ ] Settlement and payout
- [ ] Reconciliation and ledger
- [ ] Refund/partial refund allocation
- [ ] Deposits and cancellation fees
- [ ] Payout reporting

## 15. Acceptance criteria

### Marketplace
- [ ] Customers discover platform businesses and categories dynamically
- [ ] Categories are platform-controlled
- [ ] Products and services both discoverable
- [ ] Eligibility filters enforced
- [ ] Unreceived physical marketplace submissions are not purchasable
- [ ] Marketplace stock is separated from private inventory

### Shopping/booking
- [ ] Add products and select bookings in one marketplace session
- [ ] Continue browsing without losing either context
- [ ] Multiple businesses/bookings supported where permitted
- [ ] Unified checkout review
- [ ] Separate order and booking records/lifecycles
- [ ] Failures do not silently corrupt or falsely confirm transactions

### Storefront
- [ ] Independent business storefronts
- [ ] Private product and service offerings
- [ ] Store-specific cart/checkout and booking context
- [ ] Store tracking is independent
- [ ] Marketplace participation not required for private selling

### Tracking
- [ ] Marketplace purchases and bookings tracked in marketplace
- [ ] Private purchases/bookings tracked in relevant storefront
- [ ] Transaction context cannot accidentally cross

### Administration
- [ ] Business offering and booking configuration
- [ ] Marketplace submissions and status
- [ ] Receiving/verification gate
- [ ] Platform category/eligibility controls
- [ ] Backend enforcement and audit

## 16. Deferred scope boundaries

Fund allocation, seller/provider payouts, commissions, settlement, reconciliation, detailed warehouse operations, delivery routing, courier integration, dispatch, returns, and fulfilment orchestration are not current experience-completion deliverables. Their future design must use the transaction IDs, business ownership, marketplace/private context, order/booking boundaries, and eligibility/stock distinctions established now.

## 17. Implementation workflow

For each phase:
1. Review the applicable requirements in this document.
2. Audit the current code and dependencies.
3. Reuse sound existing implementation; redesign incorrect foundations.
4. Implement the scoped phase.
5. Run relevant type checks, unit/integration tests, architecture checks, and UI/edge-case verification.
6. Compare results against acceptance criteria.
7. Update this document with verified status, test results, remaining gaps, and the next phase.

No feature is marked complete solely because it renders. Functional behavior, backend enforcement, error/empty/loading states, and required tests must be verified.


## 18. Locked architectural decisions

1. Marketplace categories are Simatu-owned.
2. Businesses can belong to multiple marketplace categories.
3. Products and services are separate domains.
4. Product attributes and measurements are typed, flexible, and configurable.
5. Marketplace shopping and bookings coexist in one customer session.
6. Unified checkout does not merge orders and bookings into one lifecycle.
7. Marketplace and private storefront transactions are separate contexts.
8. Marketplace transactions use marketplace tracking.
9. Private storefront transactions use their storefront tracking experiences.
10. Required physical marketplace products must be received and verified/eligible before marketplace purchase; a request or admin toggle alone cannot bypass this gate.
11. Marketplace stock is distinguished from private business inventory.
12. Detailed fund allocation, payouts, delivery, logistics, and fulfilment engines are deferred until the customer experiences and transaction boundaries are completed.

These decisions should only be revisited if implementation or testing exposes a genuine architectural problem—not simply to re-litigate agreed requirements.


## Implementation progress — Phase A (initial domain foundation)

### Completed on `codex/simatu-work`

- Added `src/domain/marketplace/types.ts` with typed contracts for Business, Offering, ProductOffering, ServiceOffering, product variants and inventory summaries, typed attributes and measurements, booking selections and lifecycle, platform marketplace categories and business-category assignments, and receiving/verification records.
- Added `src/domain/marketplace/attribute-validation.ts` with runtime validation for text, dates, numeric bounds, booleans, single-select, multi-select, and measurements including units and range constraints.
- Added `tests/unit/marketplace-attribute-validation.test.ts` to cover those validation paths and issue aggregation.

### Not yet integrated

These contracts intentionally do not alter existing product API responses, storefront rendering, checkout, database tables, inventory, or booking behaviour. Legacy data migration, database enforcement, category persistence, receiving workflow, and service booking implementation remain outstanding. No automated checks have been run remotely; run the local test suite and build after pulling these commits.


## Implementation progress — Phase A (platform category persistence)

### Added on `codex/simatu-work`

- Added `supabase/migrations/20261126130000_create_platform_marketplace_categories.sql` to introduce platform-owned `marketplace_categories` and many-to-many `store_marketplace_categories` tables.
- Seeded the 18 platform discovery categories represented by the current marketplace discovery taxonomy.
- Added indexes, integrity constraints, RLS enablement, and revoked direct access from `PUBLIC`, `anon`, and `authenticated` roles. Existing store-specific `categories` and `subcategories` remain unchanged.

### Deployment note

This is a version-controlled migration only. It has not been applied to any database. The business-to-marketplace-category assignment table is empty until a future controlled backfill/admin workflow populates it. The existing store registry is used as the business identity foundation for this increment.


## Taxonomy consolidation and classification governance

- Consolidated public discovery tiles from 18 to 17 by merging `Everyday Living` into canonical `Home & Living` (`spaces` ID retained for route compatibility).
- Merged household subcategories into Home & Living and removed duplicate Home Organisation; legacy `living` route ID resolves to the consolidated destination.
- Updated platform category seed to Home & Living and removed redundant Everyday Living entry.
- Added a restricted `Sexual Wellness` category with minimum age 18 as a taxonomy classification separate from Technology. It is not a public discovery tile and has no client access; age/visibility enforcement must be implemented and tested before use.
- Created `docs/MARKETPLACE_TAXONOMY_GOVERNANCE.md` with classification layers, category boundaries, overlap rules, and category review gate.
- Remaining audit: review all subcategory terms for overlap across parent categories, then implement structured classification/search synonyms and restricted-audience enforcement.
