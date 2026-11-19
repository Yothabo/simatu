# AdminCard

## Purpose
The single card surface for the admin. Container for any grouped content:
KPI tiles, settings rows, activity lists, charts, tables.

## Variants
| Variant | When to use |
|---------|-------------|
| `padding="md"` (default) | Standard card with content inside |
| `padding="lg"` | Card with a large hero area (modal-like content) |
| `padding="sm"` | Compact card (inline alerts, small stat blocks) |
| `padding="none"` | Flush cards — rows paint edge-to-edge (tables, lists) |

There is exactly one visual style. Card hover does **not** change the card
surface — hover is reserved for interactive rows inside a card (see
`AdminRow`). A card is never a button.

## States
| State          | Notes |
|----------------|-------|
| default        | `CARD_CHROME` chrome, background from `.admin-card-bg` (theme-aware) |
| hover          | No change. Cards are not interactive. |
| focus-visible  | No change on the card itself. Focus lives on interactive children. |
| active         | N/A |
| disabled       | N/A — a disabled card is a page-level decision, not a card variant |
| loading        | N/A — use `SkeletonBlock` inside the card |
| error          | N/A — use `AdminEmptyState` or inline error text |

## Padding scale
`none` → 0
`sm`   → var(--admin-space-sm)   = 12px
`md`   → var(--admin-space-md)   = 16px
`lg`   → var(--admin-space-lg)   = 20px

## Accessibility
- Renders a plain `<div>`. If the card is a landmark, the consumer wraps it
  in `<section aria-labelledby>` or `<article>`.
- Card does not trap focus; interactive children manage their own focus.

## Tokens used
- radius:    --ds-radius-lg
- border:    --admin-border-strong
- surface:   --admin-surface (via .admin-card-bg)
- grid:      --admin-card-grid-size
- padding:   --admin-space-sm / -md / -lg

## Reference
Byte-for-byte match with
`features/admin/components/shared/cardChrome.ts` + the `admin-card-bg`
class in `admin-theme.css`. If either changes, this component updates to
match. The DS is the source of truth going forward; the settings files
will be migrated to consume this component in a later pass.
