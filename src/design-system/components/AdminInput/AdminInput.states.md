# AdminInput / AdminTextarea / AdminSelect

## Purpose
Shared family of form controls. Same visual contract across all three so
admin forms look uniform regardless of input type.

## Shared visual contract
- Padding: var(--admin-space-xs) vertical / var(--admin-space-sm) horizontal
- Radius: var(--ds-radius-lg)
- Border: 1px solid var(--admin-border-strong)
- Background: var(--admin-surface)
- Text: var(--admin-text-primary), var(--admin-size-body)
- Focus: border-color var(--admin-focus) + 2px focus ring at 20% opacity
- Disabled: background var(--admin-surface-subtle), opacity 0.6, not-allowed
- Transition: 150ms ease on border-color and box-shadow

## AdminInput
- Types: text, email, password, number, url, search, tel
- `numeric` prop adds tabular-nums (prices, quantities, SKUs)
- `autoFocus` for search popovers
- `readOnly` supported but discouraged in admin forms

## AdminTextarea
- Default rows 3, resize vertical, minHeight 64px
- Same border/focus/disabled treatment

## AdminSelect
- Native `<select>` styled with a custom chevron SVG
- `placeholder` renders a disabled empty option
- Options array: { value, label, disabled? }
- Preserves native keyboard navigation and mobile picker

## States
| State          | Notes |
|----------------|-------|
| default        | Neutral border, surface background |
| hover          | No change (native browser behavior on select) |
| focus / focus-visible | Border becomes --admin-focus, focus ring appears |
| active         | No special (native) |
| disabled       | Subtle background, 60% opacity, not-allowed cursor |
| readOnly       | Text cursor becomes default (input only) |
| error          | Handled by AdminField (error message below); input stays neutral |

## Accessibility
- All three pass through aria-label and native form attributes.
- AdminField pairs the label with htmlFor / id.
- Focus ring always visible.
- AdminSelect keeps native keyboard behavior (arrow keys, typeahead, Home/End).

## Tokens used
- border-color: --admin-border-strong, focus state --admin-focus
- background: --admin-surface / --admin-surface-subtle (disabled)
- text: --admin-text-primary
- padding, radius, font-size: tokens only
