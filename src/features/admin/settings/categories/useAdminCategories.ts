import { useCallback, useEffect, useState } from 'react';
import type { Category, Editor, Storefront, Subcategory } from './types';
import type { CategoryFormSubmitData } from './category-form/types';
import {
  fetchAdminCategories,
  reorderAdminCategories,
  saveAdminCategoryEditor,
  updateAdminCategoryStatus,
} from './adminCategories.api';

type Args = {
  accessToken: string;
  adminRole: string;
  assignedStorefront: Storefront | null;
};

export function useAdminCategories({
  accessToken,
  adminRole,
  assignedStorefront,
}: Args) {
  const isSuperAdmin = adminRole === 'super_admin';
  const [storefront, setStorefront] = useState<Storefront>(
    assignedStorefront ?? 'yotaabo',
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [editor, setEditor] = useState<Editor | null>(null);
  const [name, setName] = useState('');
  const [sortOrder, setSortOrder] = useState('0');

  useEffect(() => {
    if (assignedStorefront) setStorefront(assignedStorefront);
  }, [assignedStorefront]);

  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await fetchAdminCategories(accessToken, storefront);
      setCategories(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, storefront]);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  function openEditor(nextEditor: Editor, currentName = '', currentSort = 0) {
    setEditor(nextEditor);
    setName(currentName);
    setSortOrder(String(currentSort));
    setError('');
    setNotice('');
  }

  function closeEditor() {
    setEditor(null);
    setName('');
    setSortOrder('0');
  }

  async function submitEditor(payload: CategoryFormSubmitData) {
    if (!editor) return;
    setIsSaving(true);
    setError('');
    setNotice('');

    try {
      const successNotice = await saveAdminCategoryEditor(
        accessToken,
        storefront,
        editor,
        payload,
        categories,
      );
      setNotice(successNotice);
      closeEditor();
      await loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  }

  async function changeStatus(
    kind: 'category' | 'subcategory',
    id: string,
    isActive: boolean,
    categoryId?: string,
  ) {
    setError('');
    setNotice('');
    try {
      await updateAdminCategoryStatus(
        accessToken,
        kind,
        id,
        isActive,
        categoryId,
      );
      setNotice('Updated');
      await loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update');
    }
  }

  async function moveCategoryToPosition(
    category: Category,
    targetPosition: number,
  ) {
    setError('');
    setNotice('');
    try {
      const reordered = await reorderAdminCategories(
        accessToken,
        categories,
        category,
        targetPosition,
      );
      if (!reordered) return;
      setNotice('Order updated');
      await loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reorder');
    }
  }

  function editCategory(category: Category) {
    openEditor(
      { kind: 'edit-category', id: category.id },
      category.name,
      category.sort_order,
    );
  }

  function editSubcategory(categoryId: string, subcategory: Subcategory) {
    openEditor(
      { kind: 'edit-subcategory', id: subcategory.id, categoryId },
      subcategory.name,
      subcategory.sort_order,
    );
  }

  return {
    isSuperAdmin,
    storefront,
    setStorefront,
    categories,
    isLoading,
    isSaving,
    error,
    notice,
    editor,
    name,
    setName,
    sortOrder,
    setSortOrder,
    openEditor,
    closeEditor,
    submitEditor,
    changeStatus,
    moveCategoryToPosition,
    editCategory,
    editSubcategory,
  };
}
