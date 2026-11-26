# Simatu Master To-Do Checklist

> Consolidated backlog for product, marketplace, stores, operations, business systems, infrastructure, testing, and launch.
>
> **Status convention:** Items are not complete until implementation is verified and relevant tests pass. Existing foundations are listed separately for verification.

## 1. Product Foundation & Admin Product Form
- [ ] Verify simplified Add/Edit Product form and latest changes.
- [ ] Keep product entry focused; remove redundant helper paragraphs and placeholders.
- [ ] Confirm fields: name, storefront, status, SKU, price, supplier cost, visibility, store category/subcategory, marketplace category/subcategory, description, sizes, image URL/upload.
- [ ] Keep Additional Details collapsed by default.
- [ ] Verify filtering does not break legacy category assignments.
- [ ] Control marketplace and storefront visibility independently.
- [ ] Validate required fields, pricing, SKU rules, images, sizes, save/edit behavior.
- [ ] Test create, edit, publish, unpublish, draft, and error states.

## 2. Poshies — Reusable Product-Store Template
- [ ] Finish storefront UI and hero.
- [ ] Complete category/subcategory navigation and discovery.
- [ ] Finish product cards and product detail/modal.
- [ ] Add controlled sample products and valid test images.
- [ ] Verify responsive mobile and desktop.
- [ ] Complete cart add/remove/update quantity and persistence.
- [ ] Complete variants/sizes and variant-specific cart lines.
- [ ] Finish checkout and validation.
- [ ] Persist orders and implement order status handling.
- [ ] Verify New Arrivals, Best Sellers, Trending use real data and correct rules.
- [ ] Confirm visibility and merchandising.
- [ ] Complete design-system consistency and visual QA.
- [ ] Test full customer journey; make Poshies the reusable product-store template.

## 3. Yotaabo — Service Store & Booking System
- [ ] Rebuild as a service business, not a product store.
- [ ] Define service categories/subcategories.
- [ ] Create service entities (description, price, duration, availability).
- [ ] Support providers/personnel if applicable.
- [ ] Build service discovery and detail views.
- [ ] Implement booking calendar and time-slot selection.
- [ ] Capture customer details and booking confirmation/reference.
- [ ] Implement booking statuses, history, cancellation, rescheduling.
- [ ] Prevent double booking and enforce availability.
- [ ] Admin service, provider, and schedule management.
- [ ] Admin booking workflows: confirm, reject, cancel, reschedule.
- [ ] Test full booking flow and persistence.

## 4. Marketplace Catalogue & Discovery
- [ ] Finish independent marketplace catalogue and store-ownership boundaries.
- [ ] Complete Simatu-controlled taxonomy and category/subcategory mapping.
- [ ] Finish marketplace attributes/scopes and attribute UI.
- [ ] Complete Admin product review/approval/nomination/activation lifecycle.
- [ ] Discovery grid: 2 columns mobile, 4 desktop.
- [ ] Search, filters, sorting, progressive loading, and loading/empty/error states.
- [ ] Fair seller/product exposure and documented ranking rules.
- [ ] Category/subcategory carousel with store listings beneath.
- [ ] Product detail/modal and variant selection.
- [ ] Review API risks: inactive-product Admin management, stale attributes, variant validation, image URL safety.
- [ ] Ensure marketplace products do not bind legacy store-product IDs incorrectly.
- [ ] Finish marketplace cart and order administration.
- [ ] Test checkout, order snapshots, and order lifecycle.
- [ ] Payment gateway: initiation, verification, confirmation, failures, refunds, reconciliation, secure webhooks.
- [ ] Prevent duplicate payment processing; verify idempotency.

## 5. Business Center — Subscriptions
- [ ] Define plans, features, limits, billing periods.
- [ ] Implement lifecycle, trials if needed, upgrades, downgrades, cancellations.
- [ ] Implement renewals, billing records, history.
- [ ] Build store/Admin subscription workflows.
- [ ] Connect subscriptions to store feature access and limits.
- [ ] Implement billing and reporting.
- [ ] Test transitions, renewals, cancellation, failed billing, access enforcement.

## 6. Business Center — Promotions
- [ ] Create/edit/activate promotions and date lifecycle.
- [ ] Percentage and fixed discounts.
- [ ] Product/category/store scope.
- [ ] Eligibility, stacking, exclusions.
- [ ] Server-side checkout validation.
- [ ] Integrate with discovery, products, cart, checkout.
- [ ] Performance reporting.
- [ ] Test expired, invalid, overlapping, stacked, abuse cases.

## 7. Business Center — Campaigns
- [ ] Create/edit campaigns (platform/store/product scope).
- [ ] Review and platform approval.
- [ ] Separate platform approval from store participation/agreement.
- [ ] Participation, responsibilities, schedules, lifecycle.
- [ ] Pause/resume/cancel/complete/archive.
- [ ] Budgets, funding, costs, separately funded optional services.
- [ ] Attribution and performance reporting.
- [ ] Privacy, consent, participation rules.
- [ ] Connect campaigns to promotions, advertising, analytics.
- [ ] Test lifecycle, participation, budget, reporting.

## 8. Business Center — Advertising
- [ ] Define inventory, placements, formats.
- [ ] Sponsored products and store campaigns.
- [ ] Advertiser/store eligibility and approval.
- [ ] Schedules, budgets, pricing.
- [ ] Track real impressions, clicks, conversions.
- [ ] Reporting and billing/charge records as applicable.
- [ ] Clearly distinguish paid from organic discovery.
- [ ] Protect organic fairness and marketplace usability.
- [ ] Integrate campaigns, discovery, intelligence.
- [ ] Test targeting, schedule, budget limits, reporting, abuse controls.

## 9. Business Center — Commission
- [ ] Define commission rules and platform/store/category structures.
- [ ] Calculate commission on valid orders.
- [ ] Commission records and history.
- [ ] Cancellation, refund, reversal, adjustment handling.
- [ ] Settlement/payout records and workflows as applicable.
- [ ] Store earnings and commission reporting.
- [ ] Integrate with order/payment records.
- [ ] Test math, rounding, partial refunds, cancellations, reconciliation.

## 10. Business Center — Intelligence & Analytics
- [ ] Analytics for store, product, sales, customer, discovery, inventory using real data.
- [ ] Campaign, promotion, advertising performance insights.
- [ ] Trends and actionable recommendations.
- [ ] No fabricated metrics, traffic, sales, trends, attribution.
- [ ] Data freshness, aggregation, privacy rules.
- [ ] Reconcile reports to orders, inventory, events.

## 11. POS, Direct Sales & Receipts
- [ ] Complete direct-sale/POS product selection.
- [ ] Variants/sizes and quantity selection.
- [ ] Totals and permitted discounts.
- [ ] Payment method and transaction status.
- [ ] Completed and voided sales.
- [ ] Correct inventory effects and cost snapshots.
- [ ] Transaction integrity and duplicate-sale prevention.
- [ ] Generate, save, share receipts.
- [ ] Store name in receipt and saved filename.
- [ ] Remove irrelevant receipt actions; retain Save Receipt and Share Receipt.
- [ ] Test failures/voids, stock changes, receipts.

## 12. Inventory
- [ ] Stock receiving.
- [ ] Adjustments and movement history.
- [ ] Reduce stock on completed sales/orders.
- [ ] Restore stock on cancellation/refund according to policy.
- [ ] Variant-level stock.
- [ ] Low-stock alerts and availability display.
- [ ] Prevent negative stock and overselling.
- [ ] Concurrency and transaction safety.
- [ ] Real DB integration and inventory UI tests.
- [ ] Permissions and security review.

## 13. Admin & Business Center Overall
- [ ] Complete Admin navigation and screens.
- [ ] Overview, Products, Inventory, Orders, POS, Receipts, Store Management.
- [ ] Marketplace, Promotions, Campaigns, Advertising, Subscriptions, Commission, Intelligence.
- [ ] Remove placeholders; make controls functional or clearly disabled.
- [ ] Consistent loading, empty, error, success states.
- [ ] Modal consistency, responsiveness, performance.
- [ ] Role-based navigation/data access.
- [ ] Investigate historical blank-screen regression before broad changes.
- [ ] Diagnose slow Admin/session restoration; eliminate blocking loads and add skeletons as needed.
- [ ] Verify Super Admin and Store Admin flows/isolation.

## 14. Settings, Configuration & Seating
- [ ] Store profile, identity, contact, branding, visibility.
- [ ] Operational configuration, preferences, notifications.
- [ ] Policies and fulfillment/delivery configuration.
- [ ] Platform settings: marketplace, commission, subscriptions, promotions, campaigns, advertising.
- [ ] Platform feature controls.
- [ ] Recover/confirm seating requirements before implementation; exact earlier spec is unverified.
- [ ] Provisional seating scope: tables/seats, floor plan, available/occupied/reserved states, capacity, customer-to-table assignment, reservations, availability, turnover, reassignment, booking-to-table workflows.
- [ ] Admin controls after scope confirmation.
- [ ] Test seating/reservations and booking/POS integration.

## 15. Customers & Complete Order Lifecycle
- [ ] Customer profiles/contact details.
- [ ] Order history and activity.
- [ ] Privacy and data controls.
- [ ] Confirmation, processing, fulfillment/delivery, completion.
- [ ] Cancellation, refunds, payment confirmation, reconciliation.
- [ ] Status history and Admin controls.
- [ ] Prevent client manipulation of price, quantity, availability, ownership.
- [ ] Correct snapshots and store isolation.

## 16. Marketing & Growth
- [ ] Platform/store/product campaign capabilities.
- [ ] Acquisition, retention, discovery, conversion, repeat purchases.
- [ ] Digital/social and cross-store use cases.
- [ ] Participation, responsibilities, budget/funding/cost, attribution.
- [ ] Consent and privacy.
- [ ] Separate optional paid services from standard participation.
- [ ] Real performance tracking/reporting.

## 17. Homepage, Discovery & Design System
- [ ] Finish hero positioning, overlay, highlights, motion, responsiveness.
- [ ] Discover button near hero bottom.
- [ ] Lighter overlay and subtle white shadow highlights.
- [ ] Restore/verify PixelBlast or canvas; no rendering stub.
- [ ] Complete discovery categories/subcategories.
- [ ] Category carousel with store listings below.
- [ ] Search, filters, sorting, product discovery, fair ranking.
- [ ] Loading, empty, error states.
- [ ] Mobile/desktop layouts.
- [ ] White backgrounds and charcoal text direction.
- [ ] Remove unwanted beige/gradients and inconsistent hard-coded colors.
- [ ] Standardize typography, spacing, buttons, cards, modals, storefront styling.
- [ ] Reusable storefront design system.

## 18. Store Onboarding & Scalability
- [ ] Registration, identity, store type, configuration, permissions, activation.
- [ ] Reusable product-store and service-store templates.
- [ ] Shared components for categories, attributes, discovery, cart, checkout, Admin, branding, permissions.
- [ ] Configure stores instead of duplicating code.
- [ ] Store type, categories, attributes, appearance, commercial rules.
- [ ] Test onboarding a new store from reusable templates.

## 19. Security, Permissions & Privacy
- [ ] Authentication: login, session persistence/restoration, logout.
- [ ] Expired sessions, password reset/update, errors.
- [ ] Super Admin/Store Admin roles.
- [ ] Store isolation in UI, APIs, database policies.
- [ ] Review RLS, privileges, public endpoints.
- [ ] Review product, marketplace, order, inventory, POS authorization.
- [ ] Image upload/URL handling.
- [ ] Validate inputs, prices, quantities, ownership, transactions.
- [ ] Payment/webhook/idempotency security.
- [ ] Customer data, secrets, environment protection.
- [ ] Store Admin cannot access other stores or Super Admin controls.

## 20. Testing & Quality Gates
- [ ] Unit tests: products, variants, attributes, categories, cart/pricing, promotions, commission, subscriptions, bookings, campaigns, inventory.
- [ ] API tests: products, marketplace, orders, cart, checkout, Admin, isolation, auth, validation, errors, rate limits.
- [ ] DB tests: migrations, foreign keys, ownership, isolation, orders, stock integrity, concurrency.
- [ ] Playwright/browser end-to-end suite (implementation not confirmed).
- [ ] Isolated test environment; no production-capable env, live production DB writes, or real emails.
- [ ] Test discovery/category/product/cart/checkout/order journey.
- [ ] Test Admin login/dashboard/product/inventory/orders/POS/receipts/Business Center.
- [ ] Regression: homepage, Admin, storefront, store separation, navigation, product form, cart, checkout, orders, inventory, mobile.
- [ ] TypeScript, architecture, build, security, performance gates.
- [ ] Investigate large chunks/files and stale Browserslist data.
- [ ] Verify current branch tests/build; historical results do not establish current status.

## 21. Database, Infrastructure & Deployment
- [ ] Verify migrations on intended environment (owner-applied).
- [ ] Schema/app alignment, RLS, privileges, indexes, performance, transactions.
- [ ] Backup and recovery procedures.
- [ ] Migration safety, legacy compatibility, rollback.
- [ ] Netlify functions, environment, secrets, build/deployment.
- [ ] Logging, monitoring, uptime, performance.
- [ ] Deployment and rollback documentation.
- [ ] Assistant must not apply migrations; owner applies them.

## 22. Cross-System Integration
- [ ] Products ↔ Storefront, Marketplace, Inventory.
- [ ] Variants ↔ Products, Cart, Checkout, Orders, Inventory.
- [ ] Inventory ↔ POS, Orders, Cancellations, Refunds.
- [ ] Promotions ↔ Discovery, Products, Cart, Checkout.
- [ ] Campaigns ↔ Stores, Products, Promotions, Advertising, Analytics.
- [ ] Advertising ↔ Discovery, Campaigns, Analytics.
- [ ] Subscriptions ↔ Store access, features, billing, limits.
- [ ] Commission ↔ Orders, Refunds, Settlements.
- [ ] Intelligence ↔ Sales, Discovery, Inventory, Campaigns, Promotions, Ads.
- [ ] Customers ↔ Orders, Checkout, Marketing.
- [ ] Bookings ↔ Services, Availability, Customers, Admin.
- [ ] Receipts ↔ Direct sales, Orders, Payments.
- [ ] Verify duplicates, totals, stock, reversals, discount/commission accuracy, reporting, permissions.

## 23. Workspace Consolidation & Code Governance
- [ ] Identify canonical workspace and branch.
- [ ] Inventory workspaces and backups.
- [ ] Distinguish unique changes from duplicates.
- [ ] Reconcile Admin Services, CorporatePortfolio, wordmarks, hero/services/campaign assets, storefront, design system.
- [ ] Review AGENTS.md and repo workflow.
- [ ] Define integration sequence and document branch state.
- [ ] Cleanup only after inventory/reconciliation and explicit authorization.
- [ ] Keep main untouched; beta protected and merge only on explicit instruction.

## 24. Known Unresolved Items to Verify
- [ ] Current branch/access/working tree.
- [ ] Product-form cleanup commits and exact contents.
- [ ] Existing category assignment compatibility.
- [ ] Admin Add Product action/tests.
- [ ] Admin loading/blank-screen regression.
- [ ] PixelBlast/canvas and homepage restoration.
- [ ] Marketplace APIs, checkout, orders, payments.
- [ ] POS/direct sales/receipt status.
- [ ] Inventory DB/concurrency verification.
- [ ] Seating scope.
- [ ] Current build, TypeScript, test results.
- [ ] Workspace recovery and duplicate changes.

## 25. Recommended Implementation Sequence
- [ ] **Phase 1 — Product foundation:** product form, attributes, taxonomy, APIs, ownership.
- [ ] **Phase 2 — Poshies:** product-store template and customer journey.
- [ ] **Phase 3 — Marketplace:** catalogue, discovery, Admin lifecycle, cart, checkout, orders, payments.
- [ ] **Phase 4 — Yotaabo:** service-store template and bookings.
- [ ] **Phase 5 — Operations:** POS, receipts, inventory, order lifecycle.
- [ ] **Phase 6 — Business Center:** subscriptions, promotions, campaigns, advertising, commission, intelligence.
- [ ] **Phase 7 — Store onboarding:** reusable setup/template validation.
- [ ] **Phase 8 — Testing:** isolated automated, E2E, integration, security, performance, regression.
- [ ] **Phase 9 — Launch readiness:** environment, deployment, monitoring, backups, recovery, final QA.

## 26. Implemented Foundations — Verify Before Counting Complete
- [ ] Product attribute engine migration.
- [ ] Marketplace-independent product foundation.
- [ ] Marketplace attribute scope.
- [ ] Marketplace orders foundation/API.
- [ ] Marketplace product API foundation.
- [ ] Marketplace checkout modal foundation.
- [ ] Variant-aware cart.
- [ ] Marketplace discovery UI integration.
- [ ] Inventory foundation/APIs.
- [ ] Business Center foundation/navigation.
- [ ] Campaign architecture documentation.
- [ ] Admin Overview Add Product wiring and interaction tests.
- [ ] Recent product-form simplification.

> Foundations still require integration, security, database, browser, and end-to-end verification.

## Project Guardrails
- [ ] Never operate on main.
- [ ] Do not merge to beta unless explicitly instructed.
- [ ] Verify approved branch before any changes.
- [ ] Do not apply DB migrations; provide owner-run instructions.
- [ ] Never claim tests/build/browser validation unless actually run.
- [ ] Do not delete backups, branches, or workspaces without permission.
- [ ] Use real data for metrics; do not fabricate activity.
