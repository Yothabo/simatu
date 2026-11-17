import {
  AdminField,
} from '../../../../../../design-system/components';
import CustomDropdown from '../../../AdminDropdown';
import type { ProductFormFieldsProps } from '../ProductFormFields.types';

type Props = Pick<
  ProductFormFieldsProps,
  | 'form'
  | 'categoryOptions'
  | 'subcategoryOptions'
  | 'isLoadingCategories'
  | 'categoryLoadError'
  | 'onChange'
>;

export default function ProductCategoryFields({
  form,
  categoryOptions,
  subcategoryOptions,
  isLoadingCategories,
  categoryLoadError,
  onChange,
}: Props) {
  return (
    <div style={GRID_STYLE}>
      <AdminField label="Category" required>
        <CustomDropdown
          value={form.category_id ?? ''}
          onChange={(value) => onChange('category', value)}
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
          onChange={(value) => onChange('subcategory', value)}
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
  );
}

const GRID_STYLE = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 'var(--admin-space-md)',
} as const;
