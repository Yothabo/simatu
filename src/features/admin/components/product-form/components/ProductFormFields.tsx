import type { CSSProperties } from 'react';
import type { ProductFormFieldsProps } from './ProductFormFields.types';
import ProductCategoryFields from './fields/ProductCategoryFields';
import ProductDescriptionField from './fields/ProductDescriptionField';
import ProductIdentityFields from './fields/ProductIdentityFields';
import ProductImageField from './fields/ProductImageField';
import ProductPricingFields from './fields/ProductPricingFields';
import ProductSizesField from './fields/ProductSizesField';

const SELECT_STYLE: CSSProperties = { width: '100%', minHeight: 42, border: '1px solid var(--admin-border)', borderRadius: 'var(--ds-radius-md)', background: 'var(--admin-surface)', color: 'var(--admin-text-primary)', padding: '8px 12px', font: 'inherit' };

export default function ProductFormFields(props: ProductFormFieldsProps) {
  return (
    <>
      <ProductIdentityFields
        form={props.form}
        adminRole={props.adminRole}
        statusValue={props.statusValue}
        setStatusValue={props.setStatusValue}
        onChange={props.onChange}
      />
      <ProductPricingFields form={props.form} onChange={props.onChange} />
      <section style={{ display: 'grid', gap: 'var(--admin-space-sm)', padding: 'var(--admin-space-md)', border: '1px solid var(--admin-border)', borderRadius: 'var(--ds-radius-lg)' }}>
        <div>
          <strong style={{ display: 'block', color: 'var(--admin-text-primary)', fontSize: 'var(--admin-size-body)' }}>Product visibility</strong>
          <span style={{ color: 'var(--admin-text-secondary)', fontSize: 'var(--admin-size-caption)' }}>Choose where customers can discover this product.</span>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--admin-text-primary)', fontSize: 'var(--admin-size-body)' }}>
          <input type="checkbox" checked={props.form.storefront_visible} onChange={(event) => props.onChange('storefront_visible', event.target.checked)} />
          Available on my storefront
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--admin-text-primary)', fontSize: 'var(--admin-size-body)' }}>
          <input type="checkbox" checked={props.form.marketplace_visible} onChange={(event) => props.onChange('marketplace_visible', event.target.checked)} />
          Available on Simatu Marketplace
        </label>
      </section>
      <ProductCategoryFields
        form={props.form}
        categoryOptions={props.categoryOptions}
        subcategoryOptions={props.subcategoryOptions}
        isLoadingCategories={props.isLoadingCategories}
        categoryLoadError={props.categoryLoadError}
        onChange={props.onChange}
      />
      <section style={{ display: 'grid', gap: 'var(--admin-space-sm)', padding: 'var(--admin-space-md)', border: '1px solid var(--admin-border)', borderRadius: 'var(--ds-radius-lg)' }}>
        <div><strong style={{ display: 'block', color: 'var(--admin-text-primary)', fontSize: 'var(--admin-size-body)' }}>Marketplace classification</strong><span style={{ color: 'var(--admin-text-secondary)', fontSize: 'var(--admin-size-caption)' }}>Separate from your storefront category. Used for Simatu-wide discovery.</span></div>
        <label style={{ display: 'grid', gap: 6, color: 'var(--admin-text-primary)', fontSize: 'var(--admin-size-body)' }}>Marketplace category
          <select value={props.form.marketplace_category_slug ?? ''} onChange={(e) => props.onChange('marketplace_category_slug', e.target.value || null)} disabled={props.isLoadingMarketplaceTaxonomy} style={SELECT_STYLE}><option value="">{props.isLoadingMarketplaceTaxonomy ? 'Loading categories…' : 'Choose marketplace category'}</option>{props.marketplaceCategoryOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
        </label>
        <label style={{ display: 'grid', gap: 6, color: 'var(--admin-text-primary)', fontSize: 'var(--admin-size-body)' }}>Marketplace subcategory
          <select value={props.form.marketplace_subcategory_id ?? ''} onChange={(e) => props.onChange('marketplace_subcategory_id', e.target.value || null)} disabled={!props.form.marketplace_category_slug || props.isLoadingMarketplaceTaxonomy} style={SELECT_STYLE}><option value="">{!props.form.marketplace_category_slug ? 'Choose category first' : props.isLoadingMarketplaceTaxonomy ? 'Loading subcategories…' : 'Choose subcategory'}</option>{props.marketplaceSubcategoryOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
        </label>
        {props.marketplaceTaxonomyError && <span role="status" style={{ color: 'var(--admin-text-secondary)', fontSize: 'var(--admin-size-caption)' }}>{props.marketplaceTaxonomyError}</span>}
      </section>
      <ProductDescriptionField form={props.form} onChange={props.onChange} />
      <ProductSizesField
        form={props.form}
        sizeInput={props.sizeInput}
        setSizeInput={props.setSizeInput}
        onAddSize={props.onAddSize}
        onRemoveSize={props.onRemoveSize}
      />
      <ProductImageField
        form={props.form}
        isUploading={props.isUploading}
        onChange={props.onChange}
        onImageUpload={props.onImageUpload}
      />
    </>
  );
}
