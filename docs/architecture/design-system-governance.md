# Design-system governance

## Homepage
Homepage owns its own tokens, typography, effects, components and styles. It must not consume Admin or Storefront design-system internals.

## Storefront
Each store explicitly selects a design-system source:

- `local`: the store owns its design tokens, foundations and components.
- `shared`: the store uses a named design system under `shared-design-systems/`.
- A shared design system may be extended by store-level token overrides; this does not transfer ownership of store-specific components.

Yotaabo and Poshies currently select the shared `storefront-foundation` and override their accent token independently. Either store may move to a local design system without changing commerce business logic.

## Admin
Admin owns its tokens, themes, foundations and component library. Admin styles must be scoped to the Admin system.

## Change control
Visual changes require an explicit design request. Structural migrations must preserve computed styles, responsive behaviour, interaction states, accessibility and motion behaviour. Token consolidation must not silently alter rendered output.
