import type { ChangeEvent } from 'react';

type AdminTextareaProps = {
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  id?: string;
  name?: string;
  rows?: number;
  maxLength?: number;
  required?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
};

export default function AdminTextarea({
  value,
  onChange,
  placeholder,
  id,
  name,
  rows = 3,
  maxLength,
  required = false,
  disabled = false,
  ariaLabel,
}: AdminTextareaProps) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      id={id}
      name={name}
      rows={rows}
      maxLength={maxLength}
      required={required}
      disabled={disabled}
      aria-label={ariaLabel}
      style={{
        width: '100%',
        paddingBlock: 'var(--admin-space-xs)',
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
        resize: 'vertical',
        minHeight: '64px',
        fontFamily: 'inherit',
        lineHeight: 1.5,
        cursor: disabled ? 'not-allowed' : 'text',
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
