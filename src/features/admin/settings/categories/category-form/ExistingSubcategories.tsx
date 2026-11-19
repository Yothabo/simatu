import { FiEye, FiEyeOff, FiTrash2 } from 'react-icons/fi';
import type { CategorySubcategoryManagerProps } from './types';
import { INPUT_STYLE, LABEL_STYLE } from './categoryForm.styles';

type ExistingSubcategoriesProps = Pick<
  CategorySubcategoryManagerProps,
  | 'existingSubcategories'
  | 'onUpdateExisting'
  | 'onToggleExistingStatus'
  | 'onMarkExistingForDeletion'
>;

export default function ExistingSubcategories({
  existingSubcategories,
  onUpdateExisting,
  onToggleExistingStatus,
  onMarkExistingForDeletion,
}: ExistingSubcategoriesProps) {
  if (existingSubcategories.length === 0) return null;

  return (
    <div style={{ marginBottom: 'var(--admin-space-md)' }}>
      <label style={LABEL_STYLE}>Existing subcategories</label>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--admin-space-xs)',
        }}
      >
        {existingSubcategories.map((sub) => {
          const isMarked = sub.markedForDeletion;

          return (
            <div
              key={sub.tempId}
              style={{
                display: 'flex',
                gap: 'var(--admin-space-xs)',
                alignItems: 'center',
                opacity: isMarked ? 0.4 : 1,
                textDecoration: isMarked ? 'line-through' : 'none',
              }}
            >
              <input
                type="text"
                value={sub.name}
                onChange={(event) =>
                  onUpdateExisting(sub.tempId, event.target.value)
                }
                disabled={isMarked}
                style={{ ...INPUT_STYLE, flex: 1 }}
              />

              <button
                type="button"
                onClick={() => onToggleExistingStatus(sub.tempId)}
                disabled={isMarked}
                aria-label={
                  sub.isActive ? 'Hide subcategory' : 'Show subcategory'
                }
                title={
                  sub.isActive
                    ? 'Visible — click to hide'
                    : 'Hidden — click to show'
                }
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--ds-radius-lg)',
                  border: '1px solid var(--admin-border-strong)',
                  background: 'transparent',
                  cursor: isMarked ? 'not-allowed' : 'pointer',
                  color: sub.isActive
                    ? 'var(--admin-status-green)'
                    : 'var(--admin-text-tertiary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {sub.isActive ? (
                  <FiEye size={14} aria-hidden="true" />
                ) : (
                  <FiEyeOff size={14} aria-hidden="true" />
                )}
              </button>

              <button
                type="button"
                onClick={() => onMarkExistingForDeletion(sub.tempId)}
                aria-label={isMarked ? 'Undo delete' : 'Delete subcategory'}
                title={isMarked ? 'Undo delete' : 'Mark for deletion'}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--ds-radius-lg)',
                  border: '1px solid var(--admin-border-strong)',
                  background: isMarked
                    ? 'var(--admin-status-red)'
                    : 'transparent',
                  cursor: 'pointer',
                  color: isMarked
                    ? 'var(--admin-on-accent)'
                    : 'var(--admin-status-red)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FiTrash2 size={14} aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>

      <p
        style={{
          fontSize: 'var(--admin-size-micro)',
          color: 'var(--admin-text-tertiary)',
          margin: 'var(--admin-space-xs) 0 0',
          lineHeight: 1.3,
        }}
      >
        Click{' '}
        <FiEye
          size={10}
          style={{ display: 'inline', verticalAlign: 'middle' }}
        />{' '}
        to toggle visibility. Click{' '}
        <FiTrash2
          size={10}
          style={{ display: 'inline', verticalAlign: 'middle' }}
        />{' '}
        to mark for deletion.
      </p>
    </div>
  );
}
