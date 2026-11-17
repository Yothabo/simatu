import AdminDropdown from '../../../components/AdminDropdown';
import CategorySubcategoryManager from './CategorySubcategoryManager';
import type { CategoryFormFieldsProps } from './types';
import { INPUT_STYLE, LABEL_STYLE } from './categoryForm.styles';

export default function CategoryFormFields({
  editor,
  category,
  isNew,
  isSubcategoryEditor,
  name,
  onNameChange,
  singleSubName,
  onSingleSubNameChange,
  sortOrder,
  onSortOrderChange,
  note,
  onNoteChange,
  totalPositions,
  subcategoryManager,
}: CategoryFormFieldsProps) {
  return (
    <>
      {!isSubcategoryEditor && (
        <div style={{ marginBottom: 'var(--admin-space-md)' }}>
          <label style={LABEL_STYLE}>Category name</label>
          <input
            type="text"
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
            placeholder="e.g., His"
            required
            maxLength={60}
            style={INPUT_STYLE}
            onFocus={(event) => {
              event.currentTarget.style.borderColor = 'var(--admin-focus)';
              event.currentTarget.style.boxShadow =
                '0 0 0 2px color-mix(in srgb, var(--admin-focus) 20%, transparent)';
            }}
            onBlur={(event) => {
              event.currentTarget.style.borderColor =
                'var(--admin-border-strong)';
              event.currentTarget.style.boxShadow = 'none';
            }}
          />
        </div>
      )}

      {isSubcategoryEditor && (
        <div style={{ marginBottom: 'var(--admin-space-md)' }}>
          <label style={LABEL_STYLE}>Subcategory name</label>
          <input
            type="text"
            value={singleSubName}
            onChange={(event) =>
              onSingleSubNameChange(event.target.value)
            }
            placeholder="e.g., Amber Oud"
            required
            maxLength={60}
            style={INPUT_STYLE}
            autoFocus
          />
        </div>
      )}

      {!isSubcategoryEditor && (
        <>
          <CategorySubcategoryManager {...subcategoryManager} />

          <div style={{ marginBottom: 'var(--admin-space-md)' }}>
            <label style={LABEL_STYLE}>Display order</label>
            <AdminDropdown
              value={sortOrder}
              onChange={onSortOrderChange}
              placeholder="Select display order…"
              options={Array.from({ length: totalPositions }, (_, index) => {
                const position = index + 1;

                return {
                  value: String(position),
                  label: `${position}${position === 1 ? ' (top)' : position === totalPositions ? ' (bottom)' : ''}`,
                };
              })}
              align="left"
            />
          </div>

          <div style={{ marginBottom: 'var(--admin-space-md)' }}>
            <div
              className="flex items-center justify-between"
              style={{ marginBottom: 'var(--admin-space-xxs)' }}
            >
              <label style={{ ...LABEL_STYLE, marginBottom: 0 }}>
                Note to technical team
              </label>

              <span
                style={{
                  fontSize: 'var(--admin-size-micro)',
                  color:
                    note.length > 180
                      ? 'var(--admin-status-amber)'
                      : 'var(--admin-text-tertiary)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {note.length}/200
              </span>
            </div>

            <textarea
              value={note}
              onChange={(event) => onNoteChange(event.target.value)}
              maxLength={200}
              rows={2}
              placeholder="What would you like us to build on the storefront?"
              style={{
                ...INPUT_STYLE,
                resize: 'vertical',
                minHeight: '60px',
                fontFamily: 'inherit',
              }}
            />
          </div>
        </>
      )}
    </>
  );
}
