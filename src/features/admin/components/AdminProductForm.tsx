import { useCallback, useEffect, useState } from 'react';
import {
  AdminFormModal,
} from '../../../design-system/components';
import { EMPTY_PRODUCT } from './product-form/constants';
import { ProductFormFields } from './product-form/components';
import {
  useProductCategories,
  useProductDraft,
  useProductImageUpload,
  useProductFormSubmit,
} from './product-form/hooks';
import { useMarketplaceTaxonomy } from './product-form/hooks/useMarketplaceTaxonomy';
import type {
  AdminProduct,
  AdminProductFormProps,
} from './product-form/types';

// Re-export so existing imports of AdminProduct from this file keep working.
// (Admin.tsx and admin.types.ts import `AdminProduct` from here.)
export type { AdminProduct } from './product-form/types';

export default function AdminProductForm({
  isOpen,
  onClose,
  onSaved,
  productToEdit,
  adminRole,
  storeSlug,
}: AdminProductFormProps) {
  const [form, setForm] = useState<AdminProduct>(EMPTY_PRODUCT);
  const [statusValue, setStatusValue] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [sizeInput, setSizeInput] = useState('');

  const { isDraftHydrated, clearDraft } = useProductDraft({
    isOpen,
    productToEdit,
    adminRole,
    storeSlug,
    form,
    setForm,
    statusValue,
    setStatusValue,
  });

  const {
    isLoadingCategories,
    categoryLoadError,
    categoryOptions,
    subcategoryOptions,
  } = useProductCategories({
    isOpen,
    isDraftHydrated,
    adminRole,
    form,
    setForm,
  });

  const { marketplaceCategoryOptions, marketplaceSubcategoryOptions, isLoadingMarketplaceTaxonomy, marketplaceTaxonomyError, selectedSubcategoryCategorySlug } = useMarketplaceTaxonomy(isOpen && isDraftHydrated, form.storefront, form.marketplace_category_slug ?? null, form.marketplace_subcategory_id ?? null);

  useEffect(() => {
    if (form.marketplace_subcategory_id && !form.marketplace_category_slug && selectedSubcategoryCategorySlug) {
      setForm((prev) => ({ ...prev, marketplace_category_slug: selectedSubcategoryCategorySlug }));
    }
  }, [form.marketplace_subcategory_id, form.marketplace_category_slug, selectedSubcategoryCategorySlug]);


  const { isUploading, handleImageUpload } = useProductImageUpload({
    setForm,
  });

  const handleClose = useCallback(() => {
    clearDraft();
    setSizeInput('');
    onClose();
  }, [clearDraft, onClose]);

  const handleChange = useCallback(
    (field: keyof AdminProduct, value: unknown) => {
      // storefront change resets category/subcategory
      if (field === 'storefront') {
        setForm((prev) => ({
          ...prev,
          storefront: value as 'yotaabo' | 'poshies',
          category: '',
          category_id: null,
          subcategory: '',
          subcategory_id: null,
          marketplace_category_slug: null,
          marketplace_subcategory_id: null,
        }));
        return;
      }

      // category change: resolve subcategory from the selected category
      if (field === 'category') {
        const selected = categoryOptions.find((item) => item.value === value);
        if (!selected) return;

        // Look up the full category object to get its first subcategory
        setForm((prev) => ({
          ...prev,
          category: selected.label.replace(/ \(Inactive\)$/, ''),
          category_id: selected.value,
          subcategory: '',
          subcategory_id: null,
        }));
        return;
      }

      if (field === 'marketplace_category_slug') {
        setForm((prev) => ({ ...prev, marketplace_category_slug: value as string | null, marketplace_subcategory_id: null }));
        return;
      }

      // subcategory change
      if (field === 'subcategory') {
        const selected = subcategoryOptions.find((item) => item.value === value);
        if (!selected) return;

        setForm((prev) => ({
          ...prev,
          subcategory: selected.label.replace(/ \(Inactive\)$/, ''),
          subcategory_id: selected.value,
        }));
        return;
      }

      setForm((prev) => ({ ...prev, [field]: value }));
    },
    [categoryOptions, subcategoryOptions],
  );

  const addSize = useCallback(() => {
    const enteredSizes = sizeInput
      .split(/[,;\n\r]+/)
      .map((size) => size.trim())
      .filter(Boolean);

    if (enteredSizes.length === 0) return;

    setForm((prev) => {
      const existing = new Set(prev.sizes.map((size) => size.toLocaleLowerCase()));
      const additions = enteredSizes.filter((size) => {
        const key = size.toLocaleLowerCase();
        if (existing.has(key)) return false;
        existing.add(key);
        return true;
      });

      return { ...prev, sizes: [...prev.sizes, ...additions] };
    });
    setSizeInput('');
  }, [sizeInput]);

  const removeSize = useCallback((size: string) => {
    setForm((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((s) => s !== size),
    }));
  }, []);

  const handleSubmit = useProductFormSubmit({
    form,
    statusValue,
    isLoadingCategories,
    categoryLoadError,
    productToEdit,
    onSaved,
    handleClose,
    setIsSaving,
  });

  return (
    <AdminFormModal
      isOpen={isOpen}
      onClose={handleClose}
      title={productToEdit ? 'Edit Product' : 'Add Product'}
      onSubmit={() => {
        void handleSubmit();
      }}
      submitLabel={productToEdit ? 'Save Changes' : 'Add Product'}
      isSubmitting={isSaving}
      size="md"
    >
      <ProductFormFields
        form={form}
        adminRole={adminRole}
        statusValue={statusValue}
        setStatusValue={setStatusValue}
        sizeInput={sizeInput}
        setSizeInput={setSizeInput}
        categoryOptions={categoryOptions}
        subcategoryOptions={subcategoryOptions}
        marketplaceCategoryOptions={marketplaceCategoryOptions}
        marketplaceSubcategoryOptions={marketplaceSubcategoryOptions}
        isLoadingMarketplaceTaxonomy={isLoadingMarketplaceTaxonomy}
        marketplaceTaxonomyError={marketplaceTaxonomyError}
        isLoadingCategories={isLoadingCategories}
        categoryLoadError={categoryLoadError}
        isUploading={isUploading}
        onChange={handleChange}
        onImageUpload={handleImageUpload}
        onAddSize={addSize}
        onRemoveSize={removeSize}
      />
    </AdminFormModal>
  );
}
