import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import {
  AdminFormModal,
} from '../../../design-system/components';
import { supabase } from '../../../utils/supabase';
import { EMPTY_PRODUCT } from './product-form/constants';
import { ProductFormFields } from './product-form/components';
import {
  useProductCategories,
  useProductDraft,
  useProductImageUpload,
} from './product-form/hooks';
import type {
  AdminProduct,
  AdminProductFormProps,
} from './product-form/types';
import { getProductStoragePath } from './product-form/utils';

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
    const trimmed = sizeInput.trim();
    if (!trimmed) return;
    if (form.sizes.includes(trimmed)) {
      setSizeInput('');
      return;
    }
    setForm((prev) => ({ ...prev, sizes: [...prev.sizes, trimmed] }));
    setSizeInput('');
  }, [form.sizes, sizeInput]);

  const removeSize = useCallback((size: string) => {
    setForm((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((s) => s !== size),
    }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!form.name.trim()) return toast.error('Name is required');
    if (form.price <= 0) return toast.error('Price must be greater than 0');
    if (
      form.supplier_cost != null &&
      (!Number.isFinite(form.supplier_cost) || form.supplier_cost < 0)
    )
      return toast.error('Supplier cost must be zero or greater');
    if (!statusValue) return toast.error('Status is required');
    if (isLoadingCategories) return toast.error('Categories are still loading');
    if (categoryLoadError) return toast.error('Categories could not be loaded');
    if (!form.category_id) return toast.error('Select a valid category');
    if (!form.subcategory_id) return toast.error('Select a valid subcategory');

    setIsSaving(true);

    const payload = {
      storefront: form.storefront,
      name: form.name.trim(),
      price: form.price,
      supplier_cost: form.supplier_cost ?? null,
      sku: form.sku?.trim().toUpperCase() || null,
      category: form.category,
      category_id: form.category_id,
      subcategory: form.subcategory,
      subcategory_id: form.subcategory_id,
      description: form.description?.trim() || null,
      image_url: form.image_url?.trim() || null,
      is_active: form.is_active,
      sort_order: form.sort_order,
      sizes: form.sizes,
      order_count: form.order_count,
    };

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error('Your session has expired. Please sign in again.');
      }

      const response = await fetch('/api/products', {
        method: productToEdit?.id ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          ...payload,
          ...(productToEdit?.id ? { id: productToEdit.id } : {}),
        }),
      });

      const responseText = await response.text();
      let data: {
        error?: string;
        product?: import('../types/admin.types').AdminRow;
      } = {};

      if (responseText.trim()) {
        try {
          data = JSON.parse(responseText);
        } catch {
          // Handle non-JSON server responses below.
        }
      }

      if (!response.ok) {
        throw new Error(data.error || 'Unable to save the product.');
      }

      if (!data.product) {
        throw new Error('The server did not confirm the saved product.');
      }

      if (
        productToEdit?.image_url &&
        productToEdit.image_url !== payload.image_url
      ) {
        const oldImagePath = getProductStoragePath(productToEdit.image_url);

        if (oldImagePath) {
          const { error: deleteError } = await supabase.storage
            .from('products')
            .remove([oldImagePath]);

          if (deleteError) {
            console.error(
              'Previous product image could not be deleted:',
              deleteError,
            );
            toast.error(
              'Product saved, but the previous image could not be deleted.',
            );
          }
        }
      }

      toast.success(productToEdit ? 'Product updated' : 'Product added');
      onSaved(data.product);
      handleClose();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Unable to save the product.',
      );
    } finally {
      setIsSaving(false);
    }
  }, [
    categoryLoadError,
    form,
    handleClose,
    isLoadingCategories,
    onSaved,
    productToEdit,
    statusValue,
  ]);

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
