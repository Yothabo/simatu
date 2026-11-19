import type { Category, Editor, Storefront } from './types';
import type { CategoryFormSubmitData } from './category-form/types';

function authHeaders(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };
}

export async function fetchAdminCategories(
  accessToken: string,
  storefront: Storefront,
): Promise<Category[]> {
  const response = await fetch(
    `/api/categories?storefront=${storefront}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (!response.ok) throw new Error('Failed to load categories');
  const data = await response.json();
  return Array.isArray(data.categories) ? data.categories : [];
}

export async function saveAdminCategoryEditor(
  accessToken: string,
  storefront: Storefront,
  editor: Editor,
  payload: CategoryFormSubmitData,
  categories: Category[],
): Promise<string> {
  const headers = authHeaders(accessToken);

  if (
    editor.kind === 'new-subcategory' ||
    editor.kind === 'edit-subcategory'
  ) {
    const isEdit = editor.kind === 'edit-subcategory';
    const response = await fetch('/api/categories/subcategories', {
      method: isEdit ? 'PATCH' : 'POST',
      headers,
      body: JSON.stringify({
        ...(isEdit ? { id: editor.id } : {}),
        category_id: editor.categoryId,
        name: payload.name,
      }),
    });
    if (!response.ok) throw new Error('Failed to save subcategory');
    return 'Saved successfully';
  }

  if (editor.kind === 'new-category') {
    const categoryResponse = await fetch('/api/categories', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: payload.name,
        sort_order: payload.sort_order,
        storefront,
        is_active: false,
        note: payload.note,
      }),
    });
    if (!categoryResponse.ok) throw new Error('Failed to create category');

    const categoryData = await categoryResponse.json();
    const newCategoryId = categoryData.category?.id ?? categoryData.id;
    if (!newCategoryId) {
      throw new Error('Category created but no ID returned');
    }

    for (const subcategory of payload.newSubcategories) {
      const response = await fetch('/api/categories/subcategories', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          category_id: newCategoryId,
          name: subcategory.name,
        }),
      });
      if (!response.ok) {
        throw new Error(
          `Failed to add subcategory "${subcategory.name}"`,
        );
      }
    }

    return 'Request submitted';
  }

  const categoryResponse = await fetch('/api/categories', {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      id: editor.id,
      name: payload.name,
      sort_order: payload.sort_order,
    }),
  });
  if (!categoryResponse.ok) throw new Error('Failed to update category');

  const original = categories.find((category) => category.id === editor.id);
  for (const subcategory of payload.existingSubcategories) {
    const originalSubcategory = original?.subcategories.find(
      (item) => item.id === subcategory.id,
    );
    if (
      originalSubcategory &&
      originalSubcategory.name !== subcategory.name
    ) {
      const response = await fetch('/api/categories/subcategories', {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          id: subcategory.id,
          name: subcategory.name,
        }),
      });
      if (!response.ok) throw new Error('Failed to update subcategory');
    }
  }

  return 'Saved successfully';
}

export async function updateAdminCategoryStatus(
  accessToken: string,
  kind: 'category' | 'subcategory',
  id: string,
  isActive: boolean,
  categoryId?: string,
): Promise<void> {
  const url =
    kind === 'category'
      ? '/api/categories'
      : '/api/categories/subcategories';
  const body: Record<string, unknown> = { id, is_active: !isActive };
  if (categoryId) body.category_id = categoryId;

  const response = await fetch(url, {
    method: 'PATCH',
    headers: authHeaders(accessToken),
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error('Failed to update');
}

export async function reorderAdminCategories(
  accessToken: string,
  categories: Category[],
  category: Category,
  targetPosition: number,
): Promise<boolean> {
  const sameGroup = categories
    .filter((item) => item.is_active === category.is_active)
    .sort((a, b) => a.sort_order - b.sort_order);

  const currentIndex = sameGroup.findIndex((item) => item.id === category.id);
  if (currentIndex === -1) return false;

  const targetIndex = targetPosition - 1;
  if (
    targetIndex === currentIndex ||
    targetIndex < 0 ||
    targetIndex >= sameGroup.length
  ) {
    return false;
  }

  const reordered = [...sameGroup];
  const [moved] = reordered.splice(currentIndex, 1);
  reordered.splice(targetIndex, 0, moved);

  const baseSortOrder = Math.min(
    ...sameGroup.map((item) => item.sort_order),
  );
  const headers = authHeaders(accessToken);

  for (let index = 0; index < reordered.length; index += 1) {
    const newSortOrder = baseSortOrder + index;
    if (reordered[index].sort_order === newSortOrder) continue;

    const response = await fetch('/api/categories', {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        id: reordered[index].id,
        sort_order: newSortOrder,
      }),
    });
    if (!response.ok) throw new Error('Failed to reorder');
  }

  return true;
}
