import type { ProductFormFieldsProps } from './ProductFormFields.types';
import ProductCategoryFields from './fields/ProductCategoryFields';
import ProductDescriptionField from './fields/ProductDescriptionField';
import ProductIdentityFields from './fields/ProductIdentityFields';
import ProductImageField from './fields/ProductImageField';
import ProductPricingFields from './fields/ProductPricingFields';
import ProductSizesField from './fields/ProductSizesField';

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
