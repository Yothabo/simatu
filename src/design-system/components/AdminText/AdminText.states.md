# AdminText

## Purpose
The single way to render text in the admin. Every heading, paragraph,
label, and numeric value goes through AdminText. The DS enforces hierarchy
here - the consumer never composes font-size / weight / line-height /
color themselves.

## Variants
| Variant | Size | Weight | Color | Default element | Use case |
|---------|------|--------|-------|-----------------|----------|
| display | 30px | 600 | primary | h1 | Page hero (Overview greeting) |
| page-title | 24px | 600 | primary | h1 | Page heading (Products, Orders, Settings) |
| section-title | 20px | 600 | primary | h2 | Section heading inside a page |
| card-title | 16px | 600 | primary | h3 | Title inside a card |
| body | 14px | 400 | primary | p | Paragraph, table cell, list row |
| supporting | 13px | 400 | secondary | p | Helper copy under a title |
| micro | 11px | 500 | tertiary | span | Uppercase micro labels |

Micro is uppercase with 0.08em tracking by default. If a consumer needs
lowercase micro, they pass a class - but the default is correct for the
90% case (metric labels, table headers, eyebrow labels, form labels).

## Element mapping
The `as` prop overrides the default element. Rules:

- display / page-title: exactly one `<h1>` per page. Never two.
- section-title: `<h2>`. One per section block.
- card-title: `<h3>`. One per card.
- body / supporting: `<p>` for paragraphs, `<span>` when inline.
- micro: `<span>` (or `<label>` for form field labels via `as="label"`).

Pick the element that reflects the document outline, not the visual size.
A large visual weight does not make something an h1 - the `as` prop does.

## Modifiers
| Modifier | Effect |
|----------|--------|
| numeric | font-variant-numeric: tabular-nums |
| truncate | overflow hidden + text-overflow ellipsis + white-space nowrap |
| className | passthrough for layout only |
| style | passthrough for layout only (margins, widths) |

## States
| State          | Notes |
|----------------|-------|
| default        | Static text - no interaction |
| hover          | N/A |
| focus-visible  | N/A - text is not focusable |
| active         | N/A |
| disabled       | N/A - use a color token at the call site if needed, but discouraged |
| loading        | N/A - use a SkeletonBlock instead of empty text |
| error          | N/A - error styling is not a text variant |

## Color rule
Color indicates the reader's attention priority, not the hierarchy level.
Primary for headings + values + body. Secondary for helper copy. Tertiary
for metadata and labels. Never use color to distinguish heading levels.

## Tokens used
Sizes, weights, line-heights, and colors come from the --admin-text-*
composite tokens in admin-typography.css. Changing a level is a one-line
change there and reflects everywhere.

## Reference
Matches the visual hierarchy that settings/categories established by hand
(CategoryRow title = card-title, CategoryRow sub = body, section header =
section-title + supporting, form labels = micro).
