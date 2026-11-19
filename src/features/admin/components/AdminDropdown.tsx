import { useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import AdminDropdownMenu from './AdminDropdownMenu';

export type AdminDropdownOption = {
  value: string;
  label: string;
};

type AdminDropdownProps = {
  value: string;
  onChange: (value: string) => void;
  options: AdminDropdownOption[];
  compact?: boolean;
  placeholder?: string;
  menuWidth?: string;
  align?: 'left' | 'right';
  iconOnly?: boolean;
  ariaLabel?: string;
  triggerIcon?: ReactNode;
  tone?: 'accent' | 'neutral';
  radioColor?: string;
};

export default function AdminDropdown({
  value,
  onChange,
  options,
  compact = false,
  placeholder = 'Select...',
  menuWidth = '100%',
  align = 'left',
  iconOnly = false,
  ariaLabel,
  triggerIcon,
  tone = 'neutral',
  radioColor = 'var(--admin-accent)',
}: AdminDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handler);

    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('keydown', handler);

    return () => document.removeEventListener('keydown', handler);
  }, [isOpen]);

  const selected = options.find((option) => option.value === value);

  return (
    <div className="relative overview-filter-dropdown" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        title={ariaLabel}
        className={`admin-type-body ${iconOnly ? 'overview-filter-trigger-icon' : ''}`}
        style={{
          WebkitAppearance: 'none',
          appearance: 'none',
          margin: 0,
          textDecoration: 'none',
          cursor: 'pointer',
          outline: 'none',
          boxSizing: 'border-box',
          width: iconOnly ? '44px' : '100%',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: iconOnly ? 'center' : 'space-between',
          textAlign: 'left',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor:
            tone === 'neutral'
              ? 'var(--admin-border-strong)'
              : 'var(--admin-accent)',
          borderRadius: iconOnly ? '50%' : 'var(--ds-radius-lg)',
          backgroundColor:
            tone === 'neutral'
              ? 'var(--admin-surface)'
              : 'var(--admin-accent)',
          color:
            tone === 'neutral'
              ? 'var(--admin-text-primary)'
              : 'var(--admin-on-accent)',
          padding: iconOnly ? 0 : compact ? '6px 12px' : '12px 16px',
        }}
      >
        {iconOnly ? (
          triggerIcon
        ) : (
          <>
            <span
              style={{
                color: selected
                  ? 'var(--admin-text-primary)'
                  : 'var(--admin-text-tertiary)',
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {selected ? selected.label : placeholder}
            </span>

            <svg
              style={{
                marginLeft: '8px',
                width: '16px',
                height: '16px',
                flexShrink: 0,
                color: 'var(--admin-text-tertiary)',
                transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 200ms ease',
              }}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </>
        )}
      </button>

      {isOpen && (
        <AdminDropdownMenu
          options={options}
          value={value}
          onChange={onChange}
          onClose={() => setIsOpen(false)}
          align={align}
          menuWidth={menuWidth}
          radioColor={radioColor}
        />
      )}
    </div>
  );
}
