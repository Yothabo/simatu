import {
  AdminField,
  AdminInput,
} from '../../../../../../design-system/components';
import CustomDropdown from '../../../AdminDropdown';
import type { ProductFormFieldsProps } from '../ProductFormFields.types';

type Props = Pick<
  ProductFormFieldsProps,
  'form' | 'adminRole' | 'statusValue' | 'setStatusValue' | 'onChange'
>;

export default function ProductIdentityFields({
  form,
  adminRole,
  statusValue,
  setStatusValue,
  onChange,
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
        <AdminField label="Status" required>
          <CustomDropdown
            value={statusValue}
            onChange={(value) => {
              setStatusValue(value);
              onChange('is_active', value === 'active');
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
    </>
  );
}

const GRID_STYLE = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 'var(--admin-space-md)',
} as const;
