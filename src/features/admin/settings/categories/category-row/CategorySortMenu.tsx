import { useEffect, useRef, useState } from 'react';
import { getCategoryTheme } from '../../../../../systems/storefront/core/configuration/categoryTheme';
import type { CategorySortMenuProps } from './types';

export default function CategorySortMenu({
  category,
  groupPosition,
  groupSize,
  onMoveToPosition,
}: CategorySortMenuProps) {
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isSortOpen) return;

    const mouseHandler = (event: MouseEvent) => {
      if (
        sortRef.current &&
        !sortRef.current.contains(event.target as Node)
      ) {
        setIsSortOpen(false);
      }
    };

    const keyHandler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSortOpen(false);
      }
    };

    document.addEventListener('mousedown', mouseHandler);
    document.addEventListener('keydown', keyHandler);

    return () => {
      document.removeEventListener('mousedown', mouseHandler);
      document.removeEventListener('keydown', keyHandler);
    };
  }, [isSortOpen]);

  const categoryTheme = getCategoryTheme(category.name);
  const sortCircleColor =
    categoryTheme?.hexColor ?? 'var(--admin-accent)';

  return (
    <div className="relative" ref={sortRef}>
      <button
        type="button"
        onClick={() => setIsSortOpen((current) => !current)}
        aria-label={`Change position of ${category.name}`}
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          border: '1px solid var(--admin-border-strong)',
          backgroundColor: 'var(--admin-surface)',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
        }}
      >
        <span
          style={{
            fontSize: 'var(--admin-size-caption)',
            fontWeight: 'var(--admin-weight-semibold)',
            fontVariantNumeric: 'tabular-nums',
            color: 'var(--admin-text-primary)',
            lineHeight: 1,
          }}
        >
          {groupPosition}
        </span>
      </button>

      {isSortOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            right: 0,
            width: '180px',
            zIndex: 100,
            maxHeight: '240px',
            overflowY: 'auto',
            backgroundColor: 'var(--admin-surface)',
            boxShadow: 'var(--admin-shadow)',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: 'var(--admin-border-subtle)',
            borderRadius: 'var(--ds-radius-lg)',
          }}
        >
          <div
            style={{
              padding: '8px 12px',
              borderBottom: '1px solid var(--admin-border-subtle)',
            }}
          >
            <div
              style={{
                fontSize: 'var(--admin-size-micro)',
                fontWeight: 'var(--admin-weight-semibold)',
                color: 'var(--admin-text-primary)',
                lineHeight: 1.2,
              }}
            >
              Sorting
            </div>

            <div
              style={{
                fontSize: 'var(--admin-size-micro)',
                color: 'var(--admin-text-tertiary)',
                lineHeight: 1.3,
                marginTop: '2px',
              }}
            >
              Determines how this section is positioned on the storefront.
            </div>
          </div>

          {Array.from({ length: groupSize }, (_, index) => {
            const position = index + 1;
            const isCurrent = position === groupPosition;

            return (
              <button
                key={position}
                type="button"
                onClick={() => {
                  setIsSortOpen(false);

                  if (!isCurrent) {
                    void onMoveToPosition(category, position);
                  }
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 'var(--admin-space-sm)',
                  padding: '8px 12px',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--admin-text-primary)',
                  fontSize: 'var(--admin-size-caption)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontVariantNumeric: 'tabular-nums',
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.backgroundColor =
                    'var(--admin-surface-subtle)';
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <span>{position}</span>

                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    border: isCurrent
                      ? `4px solid ${sortCircleColor}`
                      : '1.5px solid var(--admin-border-strong)',
                    flexShrink: 0,
                    transition: 'border 200ms ease',
                    boxSizing: 'border-box',
                  }}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
