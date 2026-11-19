# AdminField

## Purpose
The single field wrapper for admin forms. Provides the label above, the input
slot in the middle, and optional hint or error below. Eliminates the copy-
pasted uppercase micro label pattern that appears in every form.

## Props
| Prop | Type | Purpose |
|------|------|---------|
| label | string | Field label (uppercase micro) |
| children | ReactNode | Input, textarea, select, dropdown, etc. |
| hint | string? | Small helper text under the label |
| required | boolean | Shows a red asterisk after the label |
| error | string? | Error message under the field (red) |
| htmlFor | string? | Associates the label with an input id |

## Layout contract
    [LABEL *]           (uppercase micro, tertiary)
    [hint?]             (micro, tertiary)
    [children]          (input / textarea / select / custom)
    [error?]            (micro, medium weight, red)

Gap between each: --admin-space-xxs.

## States
| State | Notes |
|-------|-------|
| default | Label + input |
| hint | Adds helper text under label |
| required | Adds red asterisk |
| error | Adds red message under input |
| disabled | No shell state; the input handles its own |

## Accessibility
- Renders a real `<label htmlFor={htmlFor}>` so the input association works.
- Error uses role="alert" so it's announced.
- The asterisk is aria-hidden (screen readers use `required` on the input).

## Composes
- Nothing. Pure structural primitive.

## Tokens used
- text: --admin-size-micro, --admin-weight-medium, --admin-text-tertiary, --admin-status-red
- spacing: --admin-space-xxs
