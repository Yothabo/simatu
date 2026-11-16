# AdminButton

## Purpose
The single button for the admin. All clickable actions - form submits,
toolbar actions, table row actions, icon-only controls, segmented
selectors.

## Variants
| Variant   | When to use |
|-----------|-------------|
| primary   | The single primary action on a page or in a form |
| accent    | Accent-colored primary (reserved for accent-heavy screens) |
| neutral   | Secondary actions, toolbar buttons, cancel |
| ghost     | Tertiary actions - low emphasis, no visible border |
| danger    | Destructive actions (delete, revoke) |
| active    | Selected state inside a segmented group |

## Shapes
| Shape   | Dimensions                    | When |
|---------|-------------------------------|------|
| pill    | h44, minW 140, radius xl      | Standard button |
| circle  | 44x44, radius full            | Icon-only button |
| tab     | auto height, radius lg        | Bottom navigation tab (icon + label) |
| segment | 44x44, square corners         | Member of a segmented group |
| compact | h32, radius lg                | Inline control (inside cards, charts) |

## States
| State          | Background                       | Border                    | Text                    |
|----------------|----------------------------------|---------------------------|-------------------------|
| default        | per-variant                      | per-variant               | per-variant             |
| hover          | per-variant hover token          | per-variant               | per-variant             |
| focus-visible  | unchanged                        | 2px --admin-focus outline | unchanged               |
| active         | per-variant (opacity only)       | per-variant               | per-variant             |
| disabled       | --admin-surface-subtle           | --admin-border-subtle     | --admin-text-muted      |
| loading        | same as disabled                 | same as disabled          | three-dot indicator     |
| error          | N/A - error belongs in AdminInput or a banner |

Disabled and loading share the same surface; loading additionally swaps
the children for the three-dot indicator and sets aria-busy.

## Accessibility
- ariaLabel is required. Icon-only buttons must describe the action
  ("Delete product", "Refresh overview"), not the icon ("trash icon").
- ariaCurrent is passed through for segmented selectors ("page").
- aria-busy is set automatically when loading.
- Focus ring is always visible - do not override outline in a parent.
- Disabled buttons are not focusable via Tab (native button behavior).
  If you need a disabled-looking button that is still focusable, use
  loading instead.

## Tokens used
- surfaces:   --admin-surface / -surface-subtle
- text:       --admin-text-primary / -secondary / -muted
- accent:     --admin-accent / -accent-hover / -on-accent
- border:     --admin-border-strong / -border-subtle
- focus:      --admin-focus
- status:     --admin-status-red
- sizes:      --admin-size-supporting / -size-micro
- spacing:    --admin-space-xs / -space-sm / -space-lg
- radius:     --ds-radius-xl / -radius-lg / -radius-full
- store:      --store-chip-color (per instance)

## Reference
Superset of AccentButton in features/admin/components/AccentButton.tsx.
Every existing AccentButton usage maps cleanly to an AdminButton variant:

  AccentButton variant="dark"        -> AdminButton variant="primary"
  AccentButton variant="accent"      -> AdminButton variant="accent"
  AccentButton variant="neutral"     -> AdminButton variant="neutral"
  AccentButton variant="transparent" -> AdminButton variant="ghost"
  AccentButton variant="active"      -> AdminButton variant="active"

New capabilities over AccentButton: explicit disabled prop, loading prop
with the three-dot indicator (currently duplicated in AdminConfirmModal
and AdminProductForm), fullWidth prop.
