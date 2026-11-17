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
