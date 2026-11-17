import {
  AdminField,
  AdminTextarea,
} from '../../../../../../design-system/components';
import type { ProductFormFieldsProps } from '../ProductFormFields.types';

type Props = Pick<ProductFormFieldsProps, 'form' | 'onChange'>;

export default function ProductDescriptionField({ form, onChange }: Props) {
  return (
    <AdminField label="Description">
      <AdminTextarea
        value={form.description ?? ''}
        onChange={(e) => onChange('description', e.target.value)}
        placeholder="Write a short product description..."
        rows={3}
      />
    </AdminField>
  );
}
