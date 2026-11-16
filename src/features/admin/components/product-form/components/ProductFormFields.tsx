import { FiX } from 'react-icons/fi';
import {
  AdminField,
  AdminInput,
  AdminTextarea,
} from '../../../../../design-system/components';
import CustomDropdown from '../../AdminDropdown';
import type { AdminProduct, CategoryOption } from '../types';

type Props = {
  form: AdminProduct;
  adminRole: 'super_admin' | 'store_admin' | null | undefined;
  statusValue: string;
  setStatusValue: (value: string) => void;
  sizeInput: string;
  setSizeInput: (value: string) => void;
  categoryOptions: CategoryOption[];
  subcategoryOptions: CategoryOption[];
  isLoadingCategories: boolean;
  categoryLoadError: string | null;
  isUploading: boolean;
  onChange: (field: keyof AdminProduct, value: unknown) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onAddSize: () => void;
  onRemoveSize: (size: string) => void;
};

const GRID_STYLE = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 'var(--admin-space-md)',
} as const;

export default function ProductFormFields({
  form,
  adminRole,
  statusValue,
  setStatusValue,
  sizeInput,
  setSizeInput,
  categoryOptions,
  subcategoryOptions,
  isLoadingCategories,
  categoryLoadError,
  isUploading,
  onChange,
  onImageUpload,
  onAddSize,
  onRemoveSize,
}: Props) {
  return (
    <>
      <AdminField label="Name" required>
        <AdminInput
          value={form.name}
          onChange={(e) => onChange('name', e.target.value)}
          placeholder="e.g. Noir Oud"
        />
      </AdminField>

      {adminRole === 'super_admin' ? (
        <AdminField label="Storefront">
          <CustomDropdown
            value={form.storefront}
            onChange={(value) => onChange('storefront', value)}
            options={[
              { value: 'yotaabo', label: 'Yotaabo' },
              { value: 'poshies', label: 'Poshies' },
            ]}
            placeholder="Select storefront"
          />
        </AdminField>
      ) : (
        <AdminField label="Storefront">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              height: '40px',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: 'var(--admin-border-strong)',
              borderRadius: 'var(--ds-radius-lg)',
              paddingInline: 'var(--admin-space-sm)',
              fontSize: 'var(--admin-size-body)',
              color: 'var(--admin-text-primary)',
              backgroundColor: 'var(--admin-surface-subtle)',
            }}
          >
            {form.storefront === 'poshies' ? 'Poshies' : 'Yotaabo'}
          </div>
        </AdminField>
      )}

      <div style={GRID_STYLE}>
        <AdminField label="Price (R)" required>
          <AdminInput
            type="number"
            value={form.price || ''}
            onChange={(e) => onChange('price', Number(e.target.value))}
            placeholder="0"
            numeric
          />
        </AdminField>

        <AdminField label="Supplier Cost (R)">
          <AdminInput
            type="number"
            value={form.supplier_cost ?? ''}
            onChange={(e) =>
              onChange(
                'supplier_cost',
                e.target.value === '' ? null : Number(e.target.value),
              )
            }
            placeholder="Not recorded"
            min={0}
            step="0.01"
            numeric
          />
        </AdminField>
      </div>

      <div style={GRID_STYLE}>
        <AdminField label="Status" required>
          <CustomDropdown
            value={statusValue}
            onChange={(v) => {
              setStatusValue(v);
              onChange('is_active', v === 'active');
            }}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'hidden', label: 'Hidden' },
            ]}
            placeholder="Select"
          />
        </AdminField>

        <AdminField label="SKU">
          <AdminInput
            value={form.sku ?? ''}
            onChange={(e) => onChange('sku', e.target.value.toUpperCase())}
            placeholder="e.g. YOT-001"
            maxLength={80}
          />
        </AdminField>
      </div>

      <div style={GRID_STYLE}>
        <AdminField label="Category" required>
          <CustomDropdown
            value={form.category_id ?? ''}
            onChange={(v) => onChange('category', v)}
            options={categoryOptions}
            placeholder={
              isLoadingCategories
                ? 'Loading categories...'
                : categoryLoadError
                  ? 'Categories unavailable'
                  : 'Select'
            }
          />
        </AdminField>

        <AdminField label="Subcategory" required>
          <CustomDropdown
            value={form.subcategory_id ?? ''}
            onChange={(v) => onChange('subcategory', v)}
            options={subcategoryOptions}
            placeholder={
              !form.category_id
                ? 'Select category first'
                : isLoadingCategories
                  ? 'Loading subcategories...'
                  : 'Select'
            }
          />
        </AdminField>
      </div>

      <AdminField label="Description">
        <AdminTextarea
          value={form.description ?? ''}
          onChange={(e) => onChange('description', e.target.value)}
          placeholder="Write a short product description..."
          rows={3}
        />
      </AdminField>

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
    </>
  );
}
