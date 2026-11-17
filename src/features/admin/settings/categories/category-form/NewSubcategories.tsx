import { FiPlus, FiX } from 'react-icons/fi';
import type { CategorySubcategoryManagerProps } from './types';
import { INPUT_STYLE, LABEL_STYLE } from './categoryForm.styles';

type NewSubcategoriesProps = Pick<
  CategorySubcategoryManagerProps,
  | 'newSubcategories'
  | 'onAdd'
  | 'onUpdateNew'
  | 'onRemoveNew'
>;

export default function NewSubcategories({
  newSubcategories,
  onAdd,
  onUpdateNew,
  onRemoveNew,
}: NewSubcategoriesProps) {
  return (
    <>
      {newSubcategories.length > 0 && (
        <div style={{ marginBottom: 'var(--admin-space-md)' }}>
          <label style={LABEL_STYLE}>Subcategories</label>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--admin-space-xs)',
            }}
          >
            {newSubcategories.map((sub) => (
              <div
                key={sub.tempId}
                style={{
                  display: 'flex',
                  gap: 'var(--admin-space-xs)',
                }}
              >
                <input
                  type="text"
                  value={sub.name}
                  onChange={(event) =>
                    onUpdateNew(sub.tempId, event.target.value)
                  }
                  placeholder="Subcategory name"
                  style={{ ...INPUT_STYLE, flex: 1 }}
                />

                <button
                  type="button"
                  onClick={() => onRemoveNew(sub.tempId)}
                  aria-label="Remove subcategory"
                  style={{
                    width: '36px',
                    height: 'auto',
                    borderRadius: 'var(--ds-radius-lg)',
                    border: '1px solid var(--admin-border-strong)',
                    background: 'transparent',
                    cursor: 'pointer',
                    color: 'var(--admin-status-red)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FiX size={14} aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={onAdd}
        style={{
          width: '100%',
          paddingBlock: 'var(--admin-space-xs)',
          marginBottom: 'var(--admin-space-md)',
          borderRadius: 'var(--ds-radius-lg)',
          borderWidth: '1px',
          borderStyle: 'dashed',
          borderColor: 'var(--admin-border-strong)',
          backgroundColor: 'transparent',
          color: 'var(--admin-text-secondary)',
          fontSize: 'var(--admin-size-caption)',
          fontWeight: 'var(--admin-weight-medium)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--admin-space-xs)',
        }}
      >
        <FiPlus size={12} aria-hidden="true" />
        Add subcategory
      </button>
    </>
  );
}
