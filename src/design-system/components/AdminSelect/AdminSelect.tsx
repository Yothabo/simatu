import type { ChangeEvent } from 'react';

type AdminSelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type AdminSelectProps = {
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  options: AdminSelectOption[];
  placeholder?: string;
  id?: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
};

export default function AdminSelect({
  value,
  onChange,
  options,
  placeholder,
  id,
  name,
  required = false,
  disabled = false,
  ariaLabel,
}: AdminSelectProps) {
  return (
    <select
      value={value}
      onChange={onChange}
      id={id}
      name={name}
      required={required}
      disabled={disabled}
      aria-label={ariaLabel}
      style={{
        width: '100%',
        height: '40px',
        paddingInline: 'var(--admin-space-sm)',
        paddingRight: 'var(--admin-space-xl)',
        borderRadius: 'var(--ds-radius-lg)',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'var(--admin-border-strong)',
        backgroundColor: disabled
          ? 'var(--admin-surface-subtle)'
          : 'var(--admin-surface)',
        color: 'var(--admin-text-primary)',
        fontSize: 'var(--admin-size-body)',
        outline: 'none',
        transition: 'border-color 150ms ease, box-shadow 150ms ease',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        WebkitAppearance: 'none',
        appearance: 'none',
        backgroundImage:
          'url("data:image/svg+xml;utf8,<svg xmlns=\\"http://www.w3.org/2000/svg\\" width=\\"16\\" height=\\"16\\" viewBox=\\"0 0 24 24\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\" stroke-linejoin=\\"round\\"><polyline points=\\"6 9 12 15 18 9\\"/></svg>")',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right var(--admin-space-sm) center',
        backgroundSize: '16px 16px',
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = 'var(--admin-focus)';
        e.currentTarget.style.boxShadow =
          '0 0 0 2px color-mix(in srgb, var(--admin-focus) 20%, transparent)';
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = 'var(--admin-border-strong)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} disabled={opt.disabled}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
