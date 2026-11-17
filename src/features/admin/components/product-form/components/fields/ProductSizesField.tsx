import { FiX } from 'react-icons/fi';
import {
  AdminField,
  AdminInput,
} from '../../../../../../design-system/components';
import type { ProductFormFieldsProps } from '../ProductFormFields.types';

type Props = Pick<
  ProductFormFieldsProps,
  'form' | 'sizeInput' | 'setSizeInput' | 'onAddSize' | 'onRemoveSize'
>;

export default function ProductSizesField({
  form,
  sizeInput,
  setSizeInput,
  onAddSize,
  onRemoveSize,
}: Props) {
  return (
    <AdminField label="Sizes" hint="Press Enter to add each size">
      <div style={{ display: 'flex', gap: 'var(--admin-space-xs)' }}>
        <AdminInput
          value={sizeInput}
          onChange={(e) => setSizeInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onAddSize();
            }
          }}
          placeholder="e.g. S, M, L"
        />
        <button
          type="button"
          onClick={onAddSize}
          disabled={!sizeInput.trim()}
          style={{
            paddingInline: 'var(--admin-space-md)',
            borderRadius: 'var(--ds-radius-lg)',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: 'var(--admin-border-strong)',
            backgroundColor: 'var(--admin-text-primary)',
            color: 'var(--admin-bg)',
            fontSize: 'var(--admin-size-supporting)',
            fontWeight: 'var(--admin-weight-medium)',
            cursor: sizeInput.trim() ? 'pointer' : 'not-allowed',
            opacity: sizeInput.trim() ? 1 : 0.5,
            flexShrink: 0,
          }}
        >
          Add
        </button>
      </div>

      {form.sizes.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'var(--admin-space-xs)',
            marginTop: 'var(--admin-space-xs)',
          }}
        >
          {form.sizes.map((size) => (
            <span
              key={size}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--admin-space-xxs)',
                paddingBlock: 'var(--admin-space-xxs)',
                paddingInline: 'var(--admin-space-sm)',
                borderRadius: 'var(--ds-radius-full)',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: 'var(--admin-border-subtle)',
                backgroundColor: 'var(--admin-surface-subtle)',
                color: 'var(--admin-text-primary)',
                fontSize: 'var(--admin-size-micro)',
                fontWeight: 'var(--admin-weight-medium)',
              }}
            >
              {size}
              <button
                type="button"
                onClick={() => onRemoveSize(size)}
                aria-label={`Remove size ${size}`}
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  color: 'var(--admin-text-tertiary)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FiX size={12} aria-hidden="true" />
              </button>
            </span>
          ))}
        </div>
      )}
    </AdminField>
  );
}
