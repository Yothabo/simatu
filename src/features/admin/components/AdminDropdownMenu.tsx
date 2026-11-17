import type { AdminDropdownOption } from './AdminDropdown';

type AdminDropdownMenuProps = {
  options: AdminDropdownOption[];
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  align: 'left' | 'right';
  menuWidth: string;
  radioColor: string;
};

export default function AdminDropdownMenu({
  options,
  value,
  onChange,
  onClose,
  align,
  menuWidth,
  radioColor,
}: AdminDropdownMenuProps) {
  return (
    <div
      role="listbox"
      style={{
        position: 'absolute',
        [align === 'right' ? 'right' : 'left']: 0,
        top: '100%',
        width: menuWidth,
        marginTop: '4px',
        zIndex: 100,
        maxHeight: 'min(320px, 60vh)',
        overflowY: 'auto',
        backgroundColor: 'var(--admin-surface)',
        boxShadow: 'var(--admin-shadow)',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'var(--admin-border-subtle)',
        borderRadius: 'var(--ds-radius-lg)',
      }}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="option"
          aria-selected={option.value === value}
          onClick={() => {
            onChange(option.value);
            onClose();
          }}
          className="admin-type-body"
          style={{
            WebkitAppearance: 'none',
            appearance: 'none',
            margin: 0,
            textDecoration: 'none',
            cursor: 'pointer',
            outline: 'none',
            boxSizing: 'border-box',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            textAlign: 'left',
            padding: '10px 16px',
            border: 'none',
            background: 'transparent',
            color: 'var(--admin-text-primary)',
          }}
          onMouseEnter={(event) => {
            event.currentTarget.style.backgroundColor =
              'var(--admin-surface-subtle)';
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <span>{option.label}</span>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              border:
                option.value === value
                  ? `5px solid ${radioColor}`
                  : '1.5px solid var(--admin-border-strong)',
              flexShrink: 0,
              transition: 'all 200ms ease',
            }}
          />
        </button>
      ))}
    </div>
  );
}
