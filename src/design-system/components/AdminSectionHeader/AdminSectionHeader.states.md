# AdminSectionHeader

## Purpose
The single section header for the admin. Heading + optional supporting
description + optional right-aligned action. Used at the top of every
section (settings blocks, overview sections, future orders/products
sections).

## Variants
| Variant | When to use |
|---------|-------------|
| default (`as="h2"`, `compact={false}`) | Section header on a page |
| `as="h1"` | Page-level title (only one per page) |
| `as="h3"` | Sub-section inside a card |
| `compact` | Header inside a card body (tighter gap, body-size title) |
| `eyebrow` | Small uppercase label above the title |

## Layout contract

    [eyebrow?]
    [Heading]                       [action?]
    [description?]

- Gap between eyebrow/heading/description: --admin-space-xs (default) or
  --admin-space-xxs (compact).
- Action sits in a right-aligned flex row; the heading truncates if it would
  collide (overflow hidden, text-overflow ellipsis, white-space nowrap).
- Description is always full-width below the heading, never inline with the
  heading.

## States
| State          | Notes |
|----------------|-------|
| default        | Static. No interaction on the header itself. |
| hover          | N/A - the header is not interactive |
| focus-visible  | N/A - focus lives on the action children |
| active         | N/A |
| disabled       | N/A |
| loading        | N/A - use a skeleton if the section is loading |
| error          | N/A - the error belongs in the section body |

## Accessibility
- Renders a real h1 / h2 / h3 (per `as` prop). Do not rely on style to
  convey hierarchy - pick the correct `as` value at the call site.
- `action` is a slot; the consumer is responsible for passing interactive
  elements with accessible names.
- Do not wrap the header in a button or a click handler. If the section
  needs to be collapsible, that is a new component (AdminSection, later).

## Tokens used
- eyebrow text:   --admin-size-micro / --admin-weight-semibold / --admin-text-tertiary
- title text:     --admin-size-heading-2 / --admin-weight-semibold / --admin-text-primary
- compact title:  --admin-size-body / --admin-weight-semibold / --admin-text-primary
- description:    --admin-size-supporting / --admin-text-secondary
- gaps:           --admin-space-xxs / --admin-space-xs / --admin-space-md

## Reference
Matches the header block used by AdminCategories.tsx
(h2 heading-2 + supporting paragraph) and the section header pattern
used inside CategoryForm.tsx. Byte-for-byte visual parity at the
default variant.
