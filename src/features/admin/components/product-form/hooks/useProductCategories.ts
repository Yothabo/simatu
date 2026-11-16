import { useEffect, useMemo } from 'react';
import {
  useAdminCategoriesCache,
  type CatalogueCategory,
} from '../../../hooks/useAdminCategoriesCache';
import { getSessionUserId } from '../utils';
import type { AdminProduct, CategoryOption } from '../types';

type Args = {
  isOpen: boolean;
  isDraftHydrated: boolean;
  adminRole: 'super_admin' | 'store_admin' | null | undefined;
  form: AdminProduct;
  setForm: (updater: (prev: AdminProduct) => AdminProduct) => void;
};

export function useProductCategories({
  isOpen,
  isDraftHydrated,
  adminRole,
  form,
  setForm,
}: Args) {
  const userId =
    adminRole === 'store_admin' || adminRole === 'super_admin'
      ? getSessionUserId()
      : null;

  const {
    categories,
    isLoading: isLoadingCategories,
    error: categoryLoadError,
  } = useAdminCategoriesCache({
    userId,
    storefront: form.storefront,
  });

  // Auto-resolve category/subcategory when categories load or form changes.
  // Does NOT auto-select on empty form — the user must pick.
  useEffect(() => {
    if (
      !isOpen ||
      !isDraftHydrated ||
      isLoadingCategories ||
      categoryLoadError ||
      categories.length === 0
    ) {
      return;
    }

    setForm((prev) => {
      const legacyCategoryName =
        prev.storefront === 'poshies' &&
        prev.category.toLowerCase() === 'spaces'
          ? 'Lounge'
          : prev.category;

      const category =
        categories.find((item) => item.id === prev.category_id) ||
        categories.find(
          (item) => item.name.toLowerCase() === legacyCategoryName.toLowerCase(),
        );

      if (!category) return prev;

      const subcategory =
        category.subcategories.find((item) => item.id === prev.subcategory_id) ||
        category.subcategories.find(
          (item) => item.name.toLowerCase() === prev.subcategory.toLowerCase(),
        );

      const nextSubcategory = subcategory ?? null;

      if (
        prev.category_id === category.id &&
        prev.category === category.name &&
        prev.subcategory_id === (nextSubcategory?.id ?? null) &&
        prev.subcategory === (nextSubcategory?.name ?? '')
      ) {
        return prev;
      }

      return {
        ...prev,
        category_id: category.id,
        category: category.name,
        subcategory_id: nextSubcategory?.id ?? null,
        subcategory: nextSubcategory?.name ?? '',
      };
    });
  }, [
    isOpen,
    isDraftHydrated,
    isLoadingCategories,
    categoryLoadError,
    form.storefront,
    form.category,
    form.category_id,
    form.subcategory,
    form.subcategory_id,
    categories,
    setForm,
  ]);

  const selectedCategory: CatalogueCategory | undefined = useMemo(
    () => categories.find((item) => item.id === form.category_id),
    [categories, form.category_id],
  );

  const categoryOptions: CategoryOption[] = useMemo(
    () =>
      categories
        .filter((item) => item.is_active || item.id === form.category_id)
        .map((item) => ({
          value: item.id,
          label: item.is_active ? item.name : `${item.name} (Inactive)`,
        })),
    [categories, form.category_id],
  );

  const subcategoryOptions: CategoryOption[] = useMemo(
    () =>
      (selectedCategory?.subcategories ?? [])
        .filter((item) => item.is_active || item.id === form.subcategory_id)
        .map((item) => ({
          value: item.id,
          label: item.is_active ? item.name : `${item.name} (Inactive)`,
        })),
    [selectedCategory, form.subcategory_id],
  );

  return {
    categories,
    isLoadingCategories,
    categoryLoadError,
    categoryOptions,
    subcategoryOptions,
  };
}
