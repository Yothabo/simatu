# Storefront system

Storefront owns the multi-store commerce experience. Its business logic is shared where behaviour is genuinely common; presentation and design identity remain configurable per store.

## Structure

- `core/`: storefront configuration, store selection, product data hooks, cart context, shared commerce contracts and theme application.
- `experience/`: shared route pages, storefront shell, product presentation, checkout flow and storefront-only styles.
- `stores/yotaabo/`: Yotaabo-owned design tokens, assets, configuration and future store-specific components.
- `stores/poshies/`: Poshies-owned design tokens, assets, configuration and future store-specific components.
- `shared-design-systems/`: explicitly selected foundations that stores may share.
- `integrations/`: Storefront-owned external integrations.

## Design-system selection

Each store selects a named shared design system or a local design system in `core/configuration/storefronts.ts`. The route-scoped `StorefrontThemeProvider` applies the active store identity and token overrides. Store-specific CSS is scoped by the `data-storefront` attribute.

Yotaabo and Poshies currently share `storefront-foundation` while overriding their accent token independently. Either store can move to a local design system without changing cart, product or checkout behaviour.

## Ownership rules

- Do not import Homepage or Admin implementation details into Storefront.
- Store-specific visual decisions belong under the relevant store or an explicitly shared design system.
- Keep cart and product data isolated by store.
- Customer name and phone are checkout/order-processing fields only; they are not a customer analytics or profiling data source.
- Preserve current routes, interactions, responsive behaviour and visual output during structural changes.
