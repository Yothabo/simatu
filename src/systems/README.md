# System ownership

Application code is being migrated into explicit system boundaries:

- `homepage/`: corporate homepage experience and its independent design system.
- `storefront/`: commerce experience, shared commerce behaviour, store-specific experiences, and design-system selection.
- `admin/`: authenticated operations and administration experience.

A system owns its pages, layouts, components, hooks, data, services, types, assets, styles, configuration, design tokens, and tests. A file belongs to the system responsible for its business or visual behaviour, not merely the system that imports it.

Only genuinely system-neutral infrastructure belongs in `src/shared/`. Cross-system imports are prohibited. Systems may depend on approved shared modules, but not on another system's implementation details.

The migration is incremental: legacy paths remain until each dependency group can be moved with imports, routes, styles, tests, and asset references updated together. Do not add new system-owned code to legacy root-level folders.
