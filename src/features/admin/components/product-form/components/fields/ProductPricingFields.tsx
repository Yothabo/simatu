import {
  AdminField,
  AdminInput,
} from '../../../../../../design-system/components';
import type { ProductFormFieldsProps } from '../ProductFormFields.types';

type Props = Pick<ProductFormFieldsProps, 'form' | 'onChange'>;

export default function ProductPricingFields({ form, onChange }: Props) {
  return (
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
  );
}

const GRID_STYLE = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 'var(--admin-space-md)',
} as const;
