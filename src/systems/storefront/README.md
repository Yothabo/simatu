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


## Adding a storefront

A new storefront should be introduced by adding a configuration entry in
`core/configuration/storefronts.ts` that satisfies `StorefrontConfiguration`. The
application generates its home, services, catalogue, About, cart and configured
policy routes from that entry; its isolated cart storage key is also derived
from the storefront key.
The configuration owns its route, category taxonomy and labels, navigation,
hero and collection variants, About-page copy, policy documents, footer links,
product fallback copy and presentation roles.

Add the storefront's semantic token stylesheet under `stores/<key>/` and
register that stylesheet in `experience/index.ts`. Do not add storefront
identity checks, palette literals, brand-prefixed selectors or store-owned
imports to shared experience pages and components. New category names are
configuration data; shared catalogue and product hooks accept category strings.

Before accepting the new storefront, run `npx tsc --noEmit && npm run build`,
verify its routes and commerce flows, and confirm the existing storefronts
retain their visual identities.
