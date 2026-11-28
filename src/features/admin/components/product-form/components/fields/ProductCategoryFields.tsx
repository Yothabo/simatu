import { AdminField } from '../../../../../../design-system/components';
import CustomDropdown from '../../../AdminDropdown';
import type { ProductFormFieldsProps } from '../ProductFormFields.types';

type Props = Pick<
  ProductFormFieldsProps,
  | 'form'
  | 'marketplaceCategoryOptions'
  | 'marketplaceSubcategoryOptions'
  | 'isLoadingMarketplaceTaxonomy'
  | 'marketplaceTaxonomyError'
  | 'onChange'
>;

export default function ProductCategoryFields({
  form,
  marketplaceCategoryOptions,
  marketplaceSubcategoryOptions,
  isLoadingMarketplaceTaxonomy,
  marketplaceTaxonomyError,
  onChange,
}: Props) {
  return (
    <div style={GRID_STYLE}>
      <AdminField label="Marketplace category" required>
        <CustomDropdown
          value={form.marketplace_category_slug ?? ''}
          onChange={(value) => onChange('marketplace_category_slug', value || null)}
          options={marketplaceCategoryOptions}
          placeholder={
            isLoadingMarketplaceTaxonomy
              ? 'Loading marketplace categories...'
              : marketplaceCategoryOptions.length
                ? 'Select'
                : 'No category assigned to this store'
          }
        />
      </AdminField>

      <AdminField label="Marketplace subcategory" required>
        <CustomDropdown
          value={form.marketplace_subcategory_id ?? ''}
          onChange={(value) => onChange('marketplace_subcategory_id', value || null)}
          options={marketplaceSubcategoryOptions}
          placeholder={
            !form.marketplace_category_slug
              ? 'Select marketplace category first'
              : isLoadingMarketplaceTaxonomy
                ? 'Loading subcategories...'
                : 'Select'
          }
        />
      </AdminField>

      {marketplaceTaxonomyError && (
        <span role="status">{marketplaceTaxonomyError}</span>
      )}
    </div>
  );
}

const GRID_STYLE = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 'var(--admin-space-md)',
} as const;
