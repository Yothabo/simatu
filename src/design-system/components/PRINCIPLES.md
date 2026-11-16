# Design System Principles

## 1. Tokens over literals
Every color, spacing, size, radius, and font in a DS component resolves
through a token. If a value does not exist as a token, it belongs in
`tokens/primitives.ts` first.

## 2. One card, one chrome
`CARD_CHROME` (see `features/admin/components/shared/cardChrome.ts` for the
current reference values) is the only card surface. Every card uses it —
gradient mask, 32px grid, `--admin-border-strong` border, `--ds-radius-lg`.
Variants exist only where a genuine second case is proven.

## 3. Every component documents states
Default, hover, focus-visible, active, disabled, loading, error (when
applicable). States are defined by the DS, never by a page-level override.

## 4. Accessibility is part of the contract
- Focus ring is always visible (never suppressed without replacement).
- Interactive components require an accessible name.
- Semantic elements (`<button>`, `<article>`, `<section>`) come first.

## 5. Composition, not configuration
A page composes DS components. A page does not pass style overrides to
restyle a DS component. If a page needs a variation, the variation is a
variant of the DS component.

## 6. Settings is the reference
`features/admin/settings/categories/` is the visual truth at time of
authoring. If a DS component renders differently from the equivalent
element in settings, the DS is wrong.

## 7. Standalone first
The DS ships without wiring. Migration of a feature to the DS is a
separate, reviewable change. Until then, the DS has zero runtime impact.
