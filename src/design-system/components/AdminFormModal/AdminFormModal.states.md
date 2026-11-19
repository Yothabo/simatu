# AdminFormModal

## Purpose
The single shell for admin forms that appear inside a modal. Enforces the
three-region contract:

- **Header** - title + close. Sticky top. Never scrolls.
- **Body** - form fields. Scrolls when content exceeds the modal.
- **Footer** - Cancel + Submit. Sticky bottom. Never scrolls.

Any admin form (product edit, category edit, store request, etc.) wraps its
fields in this shell. No form reimplements the layout.

## Props
| Prop | Type | Purpose |
|------|------|---------|
| isOpen | boolean | Controls Modal visibility |
| onClose | () => void | Fires on X, Cancel, Escape, or outside click |
| title | string | Header title |
| onSubmit | () => void | Fires on form submit |
| submitLabel | string | Label for submit button |
| cancelLabel | string | Label for cancel button. Default "Cancel" |
| isSubmitting | boolean | Locks footer, shows loading dots, disables close |
| size | 'sm' \| 'md' \| 'lg' \| 'xl' | Modal width. Default 'md' |
| children | ReactNode | Body content. Scrolls. |

## Layout contract
- Header: sticky top, borderBottom, flexShrink 0
- Body: overflowY auto, flex 1, minHeight 0 (critical for scroll)
- Footer: sticky bottom, borderTop, flexShrink 0
- Outer form: maxHeight 90vh, flex direction column, overflow hidden

The body is the only scrollable region. Header and footer are always visible.

## States
| State | Notes |
|-------|-------|
| default | Static layout |
| hover | N/A on shell; buttons handle their own |
| focus-visible | Handled by inner controls |
| submitting | Submit shows dots, Cancel and X disabled, Escape blocked |
| disabled | N/A - shell is not interactive itself |

## Accessibility
- Renders a real `<form onSubmit>`. The submit button uses type="submit".
- Escape closes unless submitting.
- Focus trap handled by the Modal primitive.
- Title is a semantic `<h2>`.

## Composes
- Modal (from src/components/Modal.tsx) for the backdrop and focus trap.

## Tokens used
- padding, border, radius, text, spacing - all --admin-* and --ds-radius-*.
- No hex, no arbitrary values.
