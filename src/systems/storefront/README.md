# Storefront system

Storefront owns commerce behaviour shared by stores and the independently configurable store experiences.

- `core/` contains cross-store commerce contracts and orchestration.
- `stores/yotaabo/` and `stores/poshies/` contain store-specific presentation and configuration.
- `shared-design-systems/` contains only explicitly selected design systems shared by stores.
- Store configuration selects a local or named shared design system and may provide store-level token overrides.

A shared commerce service does not require stores to share a visual identity.
