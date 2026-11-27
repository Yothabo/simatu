import type { CSSProperties } from 'react';
import type { ProductFormFieldsProps } from './ProductFormFields.types';
import ProductDescriptionField from './fields/ProductDescriptionField';
import ProductIdentityFields from './fields/ProductIdentityFields';
import ProductImageField from './fields/ProductImageField';
import ProductPricingFields from './fields/ProductPricingFields';
import ProductSizesField from './fields/ProductSizesField';

const SELECT_STYLE: CSSProperties = { width: '100%', minHeight: 42, border: '1px solid var(--admin-border)', borderRadius: 'var(--ds-radius-md)', background: 'var(--admin-surface)', color: 'var(--admin-text-primary)', padding: '8px 12px', font: 'inherit' };
const SECTION_STYLE: CSSProperties = { display: 'grid', gap: 'var(--admin-space-sm)', padding: 'var(--admin-space-md)', border: '1px solid var(--admin-border)', borderRadius: 'var(--ds-radius-lg)' };

export default function ProductFormFields(props: ProductFormFieldsProps) {
  return (
    <>
      <ProductIdentityFields form={props.form} adminRole={props.adminRole} statusValue={props.statusValue} setStatusValue={props.setStatusValue} onChange={props.onChange} />
      <ProductPricingFields form={props.form} onChange={props.onChange} />

      <section style={SECTION_STYLE}>
        <label style={{ display: 'grid', gap: 6, color: 'var(--admin-text-primary)', fontSize: 'var(--admin-size-body)' }}>Category
          <select value={props.form.marketplace_category_slug ?? ''} onChange={(e) => props.onChange('marketplace_category_slug', e.target.value || null)} disabled={props.isLoadingMarketplaceTaxonomy} style={SELECT_STYLE}><option value="" disabled>Select category</option>{props.marketplaceCategoryOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
        </label>
        <label style={{ display: 'grid', gap: 6, color: 'var(--admin-text-primary)', fontSize: 'var(--admin-size-body)' }}>Subcategory
          <select value={props.form.marketplace_subcategory_id ?? ''} onChange={(e) => props.onChange('marketplace_subcategory_id', e.target.value || null)} disabled={!props.form.marketplace_category_slug || props.isLoadingMarketplaceTaxonomy} style={SELECT_STYLE}><option value="" disabled>Select subcategory</option>{props.marketplaceSubcategoryOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
        </label>
        {props.marketplaceTaxonomyError && <span role="status" style={{ color: 'var(--admin-text-secondary)', fontSize: 'var(--admin-size-caption)' }}>{props.marketplaceTaxonomyError}</span>}
      </section>

      <section style={{ display: 'grid', gap: 'var(--admin-space-md)' }}>
        <ProductDescriptionField form={props.form} onChange={props.onChange} />
        <ProductSizesField form={props.form} sizeInput={props.sizeInput} setSizeInput={props.setSizeInput} onAddSize={props.onAddSize} onRemoveSize={props.onRemoveSize} />
        <ProductImageField form={props.form} isUploading={props.isUploading} onChange={props.onChange} onImageUpload={props.onImageUpload} />
      </section>
    </>
  );
}
