# AdminRow

## Purpose
A single grid row inside a card. The row primitive for lists, tables,
subcategory rows, order lists, and any repeated horizontal item.

## Variants
| Variant | When to use |
|---------|-------------|
| default (static) | Non-interactive row (subcategory display, metric inside a grid) |
| onClick | Interactive row (opens a detail, navigates) |
| border | Not the first row - draws a top separator |
| columns="…" | Any grid template, e.g. "1fr auto auto" for a table row |

## Layout contract

    [padding: --admin-space-sm --admin-space-md]
    [display: grid; align-items: center]
    [gap: --admin-space-sm]
    [gridTemplateColumns: per `columns` prop]
    [borderTop: --admin-border-subtle, only when border=true]

## States
| State          | Notes |
|----------------|-------|
| default        | Transparent background |
| hover          | --admin-surface-subtle background (interactive only) |
| focus-visible  | 2px --admin-focus outline inset (interactive only) |
| active         | No special state - treat as a click |
| disabled       | N/A - a row is either interactive or not |
| loading        | N/A - use a skeleton row |
| error          | N/A - the error belongs to the section that owns the list |

Non-interactive rows have no hover, no focus, no cursor change.
The `onClick` prop is the only way to opt into interactivity.

## Accessibility
- Interactive rows are `role="button" tabIndex={0}` with Enter and Space
  activation. ariaLabel is required when onClick is present.
- Never wrap an interactive row in another clickable element - that
  produces nested tab stops and ambiguous focus.
- Border rows use borderTop, so a list of n rows sets border=true on rows
  2..n and border=false on row 1. The consumer decides.

## Tokens used
- padding:   --admin-space-sm / --admin-space-md
- gap:       --admin-space-sm
- border:    --admin-border-subtle
- hover:     --admin-surface-subtle
- focus:     --admin-focus
