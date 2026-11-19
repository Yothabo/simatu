# AdminEmptyState

## Purpose
The single empty state for the admin. Centered icon + title + optional
description + optional action. Used when a list, table, or section has no
items to show.

## Variants
| Variant | When to use |
|---------|-------------|
| default | Standalone empty state in a page section |
| inline  | Empty state inside a flush AdminCard (edge-to-edge) |
| icon    | Optional visual anchor above the title |
| action  | Optional CTA below the description |

## Layout contract

    [icon?]
    [title]
    [description?]
    [action?]

- Center-aligned column.
- Default: dashed border + radius, padded --admin-space-2xl vertically.
- Inline: no border, no radius, padded --admin-space-lg vertically, for
  use inside an already-chromed card.

## States
| State          | Notes |
|----------------|-------|
| default        | Static |
| hover          | N/A - empty states are not interactive |
| focus-visible  | N/A - the action slot manages its own focus |
| active         | N/A |
| disabled       | N/A |
| loading        | N/A - a loading state shows a skeleton, not an empty state |
| error          | N/A - errors are shown by the section that owns the list |

## Accessibility
- Renders semantic paragraphs.
- Icon is aria-hidden - the title conveys the meaning.
- If the empty state has an action, pass it as AdminButton via `action`.
  Do not add a second wrapper button.

## Tokens used
- padding:      --admin-space-lg / --admin-space-2xl
- gap:          --admin-space-xs / --admin-space-xxs
- border:       --admin-border-subtle (dashed, default variant only)
- radius:       --ds-radius-lg (default variant only)
- title:        --admin-size-body / --admin-weight-medium / --admin-text-primary
- description:  --admin-size-supporting / --admin-text-tertiary
- icon:         --admin-text-tertiary
