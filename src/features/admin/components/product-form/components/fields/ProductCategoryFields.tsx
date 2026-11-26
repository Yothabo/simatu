import { AdminField } from '../../../../../../design-system/components';
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

const EXCLUDED_GENDER_CATEGORY = /\b(his|her|hers|his\s*and\s*hers|for\s*him|for\s*her)\b/i;

export default function ProductCategoryFields({
  form,
  categoryOptions,
  subcategoryOptions,
  isLoadingCategories,
  categoryLoadError,
  onChange,
}: Props) {
  const visibleCategories = categoryOptions.filter(
    (option) => !EXCLUDED_GENDER_CATEGORY.test(option.label),
  );
  const visibleSubcategories = subcategoryOptions.filter(
    (option) => !EXCLUDED_GENDER_CATEGORY.test(option.label),
  );

  return (
    <div style={GRID_STYLE}>
      <AdminField label="Store category" required>
        <CustomDropdown
          value={form.category_id ?? ''}
          onChange={(value) => onChange('category', value)}
          options={visibleCategories}
          placeholder={
            isLoadingCategories
              ? 'Loading categories...'
              : categoryLoadError
                ? 'Categories unavailable'
                : 'Select'
          }
        />
      </AdminField>

      <AdminField label="Store subcategory" required>
        <CustomDropdown
          value={form.subcategory_id ?? ''}
          onChange={(value) => onChange('subcategory', value)}
          options={visibleSubcategories}
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
