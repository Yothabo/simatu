# Storefront system

Storefront owns the multi-store commerce experience. Business logic is shared where behaviour is genuinely common; each store owns its visual identity and semantic token values.

## Structure

- `core/`: storefront configuration, store selection, product data hooks, cart context, shared commerce contracts and theme selection.
- `experience/`: shared route pages, storefront shell, product presentation, checkout flow and storefront-only styles.
- `stores/yotaabo/`: Yotaabo-owned design tokens, assets, configuration and store-specific presentation.
- `stores/poshies/`: Poshies-owned design tokens, assets, configuration and store-specific presentation.
- `shared-design-systems/`: reusable foundations that stores may explicitly share.
- `integrations/`: Storefront-owned external integrations.

## Design-system selection

Each store selects a named shared design system or a local design system in `core/configuration/storefronts.ts`. The route-scoped `StorefrontThemeProvider` sets the active `data-storefront` identity. Store-scoped stylesheets supply the semantic token values.

The shared foundation owns component primitives, layout geometry, spacing, sizing, breakpoints, radius and motion. Store themes own concrete colors, semantic color mappings, font families and brand-specific visual details. Runtime inline palette overrides are not used.

## Ownership rules

- Do not import Homepage or Admin implementation details into Storefront.
- Store-specific visual decisions and copy belong under the relevant store or its configuration.
- Shared components consume semantic tokens and must not contain store-specific palette literals or brand-name conditionals.
- Keep cart and product data isolated by store.
- Customer name and phone are checkout/order-processing fields only; they are not a customer analytics or profiling data source.
- Preserve current routes, interactions, responsive behaviour and store identities during structural changes.
