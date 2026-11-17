import { useEffect, useState } from 'react';
import type { Category, Editor } from './types';
import type {
  CategoryFormSubmitData,
  CategoryFormProps,
  CategorySubcategoryManagerProps,
  ExistingSubcategory,
  NewSubcategory,
} from './category-form/types';

type UseCategoryFormStateArgs = Pick<
  CategoryFormProps,
  'editor' | 'category' | 'totalPositions' | 'initialSortOrder' | 'onSubmit'
>;

export function useCategoryFormState({
  editor,
  category,
  totalPositions,
  initialSortOrder,
  onSubmit,
}: UseCategoryFormStateArgs) {
  const isNew = editor.kind === 'new-category';
  const isSubcategoryEditor =
    editor.kind === 'new-subcategory' ||
    editor.kind === 'edit-subcategory';

  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [sortOrder, setSortOrder] = useState(
    editor.kind === 'new-category' ? '' : String(initialSortOrder),
  );
  const [newSubcategories, setNewSubcategories] = useState<NewSubcategory[]>([]);
  const [existingSubcategories, setExistingSubcategories] = useState<
    ExistingSubcategory[]
  >([]);
  const [singleSubName, setSingleSubName] = useState('');

  useEffect(() => {
    if (isNew) {
      setName('');
      setNote('');
      setSortOrder('');
      setNewSubcategories([]);
      setExistingSubcategories([]);
    } else if (editor.kind === 'edit-category' && category) {
      setName(category.name);
      setNote('');
      setSortOrder(String(category.sort_order));
      setExistingSubcategories(
        category.subcategories.map((subcategory) => ({
          tempId: subcategory.id,
          id: subcategory.id,
          name: subcategory.name,
          originalName: subcategory.name,
          isActive: subcategory.is_active,
          originalIsActive: subcategory.is_active,
          markedForDeletion: false,
        })),
      );
      setNewSubcategories([]);
    } else if (isSubcategoryEditor && category) {
      const editingId =
        editor.kind === 'edit-subcategory' ? editor.id : null;
      const existing = category.subcategories.find(
        (subcategory) => subcategory.id === editingId,
      );
      setSingleSubName(existing?.name ?? '');
    }
  }, [editor, category, initialSortOrder, isNew, isSubcategoryEditor]);

  const addSubcategoryRow = () => {
    setNewSubcategories((previous) => [
      ...previous,
      { tempId: crypto.randomUUID(), name: '' },
    ]);
  };

  const updateNewSub = (tempId: string, value: string) => {
    setNewSubcategories((previous) =>
      previous.map((subcategory) =>
        subcategory.tempId === tempId
          ? { ...subcategory, name: value }
          : subcategory,
      ),
    );
  };

  const removeNewSub = (tempId: string) => {
    setNewSubcategories((previous) =>
      previous.filter((subcategory) => subcategory.tempId !== tempId),
    );
  };

  const updateExistingSub = (tempId: string, value: string) => {
    setExistingSubcategories((previous) =>
      previous.map((subcategory) =>
        subcategory.tempId === tempId
          ? { ...subcategory, name: value }
          : subcategory,
      ),
    );
  };

  const toggleExistingSubStatus = (tempId: string) => {
    setExistingSubcategories((previous) =>
      previous.map((subcategory) =>
        subcategory.tempId === tempId
          ? { ...subcategory, isActive: !subcategory.isActive }
          : subcategory,
      ),
    );
  };

  const markExistingSubForDeletion = (tempId: string) => {
    setExistingSubcategories((previous) =>
      previous.map((subcategory) =>
        subcategory.tempId === tempId
          ? {
              ...subcategory,
              markedForDeletion: !subcategory.markedForDeletion,
            }
          : subcategory,
      ),
    );
  };

  const handleSubmit = async () => {
    if (isSubcategoryEditor) {
      if (!singleSubName.trim()) return;
      const payload: CategoryFormSubmitData = {
        name: singleSubName.trim(),
        sort_order: initialSortOrder,
        note: '',
        newSubcategories: [],
        existingSubcategories: [],
      };
      await onSubmit(payload);
      return;
    }

    if (!name.trim()) return;
    await onSubmit({
      name: name.trim(),
      sort_order: sortOrder ? Number(sortOrder) : totalPositions,
      note: note.trim(),
      newSubcategories: newSubcategories.filter((subcategory) =>
        subcategory.name.trim(),
      ),
      existingSubcategories,
    });
  };

  const title = isNew
    ? 'New category request'
    : editor.kind === 'edit-category'
      ? `Edit ${category?.name ?? 'category'}`
      : editor.kind === 'new-subcategory'
        ? 'New subcategory'
        : 'Edit subcategory';

  const subcategoryManager: CategorySubcategoryManagerProps = {
    editor,
    newSubcategories,
    existingSubcategories,
    onAdd: addSubcategoryRow,
    onUpdateNew: updateNewSub,
    onRemoveNew: removeNewSub,
    onUpdateExisting: updateExistingSub,
    onToggleExistingStatus: toggleExistingSubStatus,
    onMarkExistingForDeletion: markExistingSubForDeletion,
  };

  return {
    isNew,
    isSubcategoryEditor,
    name,
    setName,
    note,
    setNote,
    sortOrder,
    setSortOrder,
    singleSubName,
    setSingleSubName,
    title,
    subcategoryManager,
    handleSubmit,
  };
}
