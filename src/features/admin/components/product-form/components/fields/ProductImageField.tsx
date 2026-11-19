import {
  AdminField,
  AdminInput,
} from '../../../../../../design-system/components';
import type { ProductFormFieldsProps } from '../ProductFormFields.types';

type Props = Pick<
  ProductFormFieldsProps,
  'form' | 'isUploading' | 'onChange' | 'onImageUpload'
>;

export default function ProductImageField({
  form,
  isUploading,
  onChange,
  onImageUpload,
}: Props) {
  return (
    <AdminField label="Product Image">
      <div style={{ display: 'flex', gap: 'var(--admin-space-xs)' }}>
        <AdminInput
          type="url"
          value={form.image_url ?? ''}
          onChange={(e) => onChange('image_url', e.target.value)}
          placeholder="https://..."
        />
        <label
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '44px',
            paddingInline: 'var(--admin-space-md)',
            borderRadius: 'var(--ds-radius-lg)',
            backgroundColor: isUploading
              ? 'var(--admin-surface-subtle)'
              : 'var(--admin-text-primary)',
            color: isUploading
              ? 'var(--admin-text-tertiary)'
              : 'var(--admin-bg)',
            fontSize: 'var(--admin-size-supporting)',
            fontWeight: 'var(--admin-weight-medium)',
            cursor: isUploading ? 'not-allowed' : 'pointer',
            opacity: isUploading ? 0.6 : 1,
            flexShrink: 0,
          }}
        >
          {isUploading
            ? '...'
            : form.image_url?.trim()
              ? 'Change'
              : 'Upload'}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            style={{ display: 'none' }}
            onChange={(e) => void onImageUpload(e)}
            disabled={isUploading}
          />
        </label>
      </div>

      {form.image_url?.trim() && (
        <div
          style={{
            marginTop: 'var(--admin-space-xs)',
            display: 'flex',
            height: '160px',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            backgroundColor: 'var(--admin-surface-subtle)',
            borderRadius: 'var(--ds-radius-lg)',
            padding: 'var(--admin-space-sm)',
          }}
        >
          <img
            src={form.image_url}
            alt="Product preview"
            style={{ height: '100%', width: '100%', objectFit: 'contain' }}
          />
        </div>
      )}
    </AdminField>
  );
}
