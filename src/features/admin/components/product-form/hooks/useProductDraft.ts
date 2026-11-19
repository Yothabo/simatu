import { useCallback, useEffect, useState } from 'react';
import { DRAFT_STORAGE_KEY, EMPTY_PRODUCT } from '../constants';
import type { AdminProduct } from '../types';

type Args = {
  isOpen: boolean;
  productToEdit: AdminProduct | null | undefined;
  adminRole: 'super_admin' | 'store_admin' | null | undefined;
  storeSlug: 'yotaabo' | 'poshies' | null | undefined;
  form: AdminProduct;
  setForm: (updater: (prev: AdminProduct) => AdminProduct) => void;
  statusValue: string;
  setStatusValue: (value: string) => void;
};

function applyStorefront(
  product: AdminProduct,
  adminRole: 'super_admin' | 'store_admin' | null | undefined,
  storeSlug: 'yotaabo' | 'poshies' | null | undefined,
): AdminProduct {
  return {
    ...product,
    storefront:
      adminRole === 'store_admin' && storeSlug
        ? storeSlug
        : product.storefront === 'poshies'
          ? 'poshies'
          : 'yotaabo',
  };
}

export function useProductDraft({
  isOpen,
  productToEdit,
  adminRole,
  storeSlug,
  form,
  setForm,
  statusValue,
  setStatusValue,
}: Args) {
  const [isDraftHydrated, setIsDraftHydrated] = useState(false);

  // Restore or initialize on open
  useEffect(() => {
    if (!isOpen) {
      setIsDraftHydrated(false);
      return;
    }

    setIsDraftHydrated(false);

    try {
      const raw = sessionStorage.getItem(DRAFT_STORAGE_KEY);
      const saved = raw
        ? (JSON.parse(raw) as {
            productId: string | null;
            form: AdminProduct;
            statusValue: string;
          })
        : null;

      const currentProductId = productToEdit?.id ?? null;

      if (
        saved &&
        currentProductId !== null &&
        saved.productId === currentProductId &&
        saved.form
      ) {
        setForm(() => applyStorefront(
          { ...EMPTY_PRODUCT, ...saved.form },
          adminRole,
          storeSlug,
        ));
        setStatusValue(saved.statusValue ?? '');
      } else {
        setForm(() =>
          applyStorefront(
            productToEdit
              ? { ...EMPTY_PRODUCT, ...productToEdit }
              : { ...EMPTY_PRODUCT },
            adminRole,
            storeSlug,
          ),
        );
        setStatusValue(
          productToEdit ? (productToEdit.is_active ? 'active' : 'hidden') : '',
        );
      }
    } catch {
      setForm(() =>
        applyStorefront(
          productToEdit
            ? { ...EMPTY_PRODUCT, ...productToEdit }
            : { ...EMPTY_PRODUCT },
          adminRole,
          storeSlug,
        ),
      );
      setStatusValue(
        productToEdit ? (productToEdit.is_active ? 'active' : 'hidden') : '',
      );
    }

    setIsDraftHydrated(true);
  }, [isOpen, productToEdit, adminRole, storeSlug, setForm, setStatusValue]);

  // Persist on change
  useEffect(() => {
    if (!isOpen || !isDraftHydrated) return;

    try {
      sessionStorage.setItem(
        DRAFT_STORAGE_KEY,
        JSON.stringify({
          productId: productToEdit?.id ?? null,
          form,
          statusValue,
        }),
      );
    } catch {
      // Storage unavailable — form remains usable.
    }
  }, [isOpen, isDraftHydrated, form, statusValue, productToEdit]);

  const clearDraft = useCallback(() => {
    try {
      sessionStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      // Ignore storage errors on close.
    }
    setIsDraftHydrated(false);
  }, []);

  return { isDraftHydrated, clearDraft };
}
