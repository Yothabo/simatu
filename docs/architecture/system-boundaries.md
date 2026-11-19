# Simatu system boundaries

## Systems

| System | Owns | Must not own |
|---|---|---|
| Homepage | Corporate landing experience, homepage sections, animations, assets, styles, tokens and configuration | Store catalog/cart/order behaviour or Admin workflows |
| Storefront | Store routing, catalog, product detail, cart, checkout, order-facing storefront behaviour, store configuration and store design systems | Corporate homepage composition or Admin-only workflows |
| Admin | Authentication, authorization, inventory, products, orders, categories, operational overview, Admin styles and tokens | Storefront presentation or customer profiling/marketing analytics |

## Dependency direction

- A system may import its own modules.
- A system may import approved, system-neutral modules from `src/shared/`.
- A system must not import another system's private modules.
- App composition, routing and top-level provider wiring belong in `src/app/`.
- Public static assets are grouped by system under `public/systems/`; imported assets live with their owning system.

## Customer-data boundary

Customer name and phone collected during checkout are operational order fields only. They may be used to process, contact about, and fulfil the specific order. They must not be used to create customer profiles, segmentation, repeat-customer metrics, lifetime-value calculations, customer comparisons, marketing analytics, or equivalent reporting.

## Migration policy

Move cohesive dependency groups. Update imports, route registrations, CSS imports, asset paths, tests and documentation in the same change. Do not delete a legacy module until its consumers have migrated and the build/test suite passes. Avoid duplicate implementations and permanent compatibility shims.
