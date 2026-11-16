# Admin Design System

Standalone component library. Based on the visual language used in
`features/admin/settings/categories/` (CategoryRow, CategoryForm,
AdminCategories) — that is the reference implementation, not a dependency.

## Rules

1. Components here import ONLY from `../../tokens/` and `../../themes/`.
2. Components here NEVER import from `features/` — no circular dependency.
3. Every component has a sibling `.states.md` documenting default, hover,
   focus-visible, active, disabled, loading, and error states.
4. Tokens are the only source of color, size, spacing, radius, and type.
   No hex, no px literals outside `tokens/primitives.ts`.
5. `Admin*.tsx` components are the public API. Consumers import from
   `design-system/components` — never from a deep path.

## Not yet wired

These components are not consumed by the app. Migration happens in a
separate pass, one feature at a time, UI-only.
