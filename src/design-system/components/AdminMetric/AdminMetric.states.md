# AdminMetric

## Purpose
A single KPI tile. Label + value + optional description, optional icon.
The atomic unit of every dashboard-style section.

## Variants
| Variant | When to use |
|---------|-------------|
| default (size="md") | Primary KPI tiles - count, value, status total |
| size="sm" | Inline tiles inside a card row - less visual weight |
| accentColor | Tints both the icon and the value text (store color, status color) |
| loading | Renders a skeleton placeholder in place of the value |

## Layout contract

    [LABEL...................] [icon?]
    [VALUE]
    [description?]

- Label is uppercase micro, single-line with ellipsis.
- Value is tabular-nums and sized per `size` prop.
- Description is optional micro text - for context, not for another metric.

## States
| State          | Notes |
|----------------|-------|
| default        | Static. Metric tiles are not interactive. |
| hover          | N/A - metrics do not react to hover |
| focus-visible  | N/A - if a tile needs to be clickable, wrap it in AdminButton with a card surface, not in AdminMetric |
| active         | N/A |
| disabled       | N/A |
| loading        | Skeleton block replaces the value only - label and description still render |
| error          | N/A - errors belong to the section that owns the metric |

## Accessibility
- Renders an article. Screen readers announce label then value.
- Value uses tabular-nums so counts do not jitter when updated.
- Icon is aria-hidden. Its meaning is already conveyed by the label.
- Do not use accentColor alone to convey status - pair it with a text
  description or an icon.

## Tokens used
- surface:      --admin-surface
- border:       --admin-border-subtle
- radius:       --ds-radius-lg
- label:        --admin-size-micro / --admin-weight-medium / --admin-text-tertiary
- value md:     --admin-size-section-title / --admin-weight-semibold
- value sm:     --admin-size-body / --admin-weight-semibold
- description:  --admin-size-micro / --admin-text-tertiary
- gaps:         --admin-space-xs / --admin-space-md
- skeleton:     --admin-surface-subtle / --ds-radius-sm

## Reference
Matches the OverviewMetric tile shape used across the current overview
sections (BusinessSummary, SalesPerformance, OrderOperations,
StoreComparison). Adds loading, size, and icon slots.
