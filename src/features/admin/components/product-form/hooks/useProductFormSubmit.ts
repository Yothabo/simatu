import { useCallback } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../../../../../utils/supabase';
import { getProductStoragePath } from '../utils';
import type { AdminProduct } from '../types';
import type { AdminRow } from '../../../types/admin.types';

type UseProductFormSubmitArgs = {
  form: AdminProduct;
  statusValue: string;
  isLoadingCategories: boolean;
  categoryLoadError: string;
  productToEdit?: AdminProduct | null;
  onSaved: (product: AdminRow) => void;
  handleClose: () => void;
  setIsSaving: Dispatch<SetStateAction<boolean>>;
};

export function useProductFormSubmit({
  form,
  statusValue,
  isLoadingCategories,
  categoryLoadError,
  productToEdit,
  onSaved,
  handleClose,
  setIsSaving,
}: UseProductFormSubmitArgs) {
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
        product?: AdminRow;
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
    setIsSaving,
    statusValue,
  ]);

  return handleSubmit;
}
