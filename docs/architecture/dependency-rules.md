# Dependency rules

1. `src/app/` composes systems; it must not become a home for system business logic.
2. `src/systems/homepage/`, `src/systems/storefront/`, and `src/systems/admin/` are isolated ownership boundaries.
3. No system may import another system's private files.
4. `src/shared/` is reserved for system-neutral infrastructure; it must not import from `src/systems/`.
5. Storefront core may define shared commerce contracts and orchestration. Brand-specific presentation belongs to a store or a named shared design system.
6. Admin design tokens and components remain Admin-owned.
7. Design systems are not shared by accident. A store explicitly selects either a local design system or a named shared design system with optional local token overrides.
8. Do not introduce new files in legacy root-level `components/`, `hooks/`, `styles/`, `design-system/`, or `utils/` locations.

The architecture checker enforces cross-system isolation for files already inside the new system roots. Legacy ownership violations are tracked and migrated in bounded batches rather than hidden behind blanket exemptions.
