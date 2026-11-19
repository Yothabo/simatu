import type { ChangeEvent, InputHTMLAttributes } from 'react';

type AdminInputProps = {
  value: string | number;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  type?: 'text' | 'email' | 'password' | 'number' | 'url' | 'search' | 'tel';
  placeholder?: string;
  id?: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  maxLength?: number;
  autoComplete?: InputHTMLAttributes<HTMLInputElement>['autoComplete'];
  autoFocus?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  /** Adds tabular-nums. Use for prices, quantities, SKUs. */
  numeric?: boolean;
  ariaLabel?: string;
};

export default function AdminInput({
  value,
  onChange,
  type = 'text',
  placeholder,
  id,
  name,
  required = false,
  disabled = false,
  readOnly = false,
  min,
  max,
  step,
  maxLength,
  autoComplete,
  autoFocus = false,
  numeric = false,
  ariaLabel,
  onKeyDown,
}: AdminInputProps) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      id={id}
      name={name}
      required={required}
      disabled={disabled}
      readOnly={readOnly}
      min={min}
      max={max}
      step={step}
      maxLength={maxLength}
      autoComplete={autoComplete}
      autoFocus={autoFocus}
      aria-label={ariaLabel}
      onKeyDown={onKeyDown}
      style={{
        width: '100%',
        height: '40px',
        paddingInline: 'var(--admin-space-sm)',
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
        fontVariantNumeric: numeric ? 'tabular-nums' : undefined,
        cursor: disabled ? 'not-allowed' : readOnly ? 'default' : 'text',
        opacity: disabled ? 0.6 : 1,
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
    />
  );
}
