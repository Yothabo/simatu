import { useEffect, useState } from 'react';
import { FiX } from 'react-icons/fi';
import Modal from '../../../../components/Modal';
import AccentButton from '../../components/AccentButton';
import type { Category } from './types';

import CategoryFormHeader from './category-form/CategoryFormHeader';
import CategoryCurrentState from './category-form/CategoryCurrentState';
import CategoryFormFields from './category-form/CategoryFormFields';

import type {
  CategoryFormProps,
  NewSubcategory,
  ExistingSubcategory,
  CategorySubcategoryManagerProps,
} from './category-form/types';

export type {
  NewSubcategory,
  ExistingSubcategory,
} from './category-form/types';

export default function CategoryForm({
  editor,
  category,
  totalPositions,
  initialSortOrder,
  isSaving,
  onSubmit,
  onCancel,
}: CategoryFormProps) {
  const isNew = editor.kind === 'new-category';
  const isSubcategoryEditor =
    editor.kind === 'new-subcategory' ||
    editor.kind === 'edit-subcategory';

  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [sortOrder, setSortOrder] = useState(
    editor.kind === 'new-category' ? '' : String(initialSortOrder),
  );
  const [newSubcategories, setNewSubcategories] = useState<
    NewSubcategory[]
  >([]);
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

      await onSubmit({
        name: singleSubName.trim(),
        sort_order: initialSortOrder,
        note: '',
        newSubcategories: [],
        existingSubcategories: [],
      });

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
      existingSubcategories: existingSubcategories.map((subcategory) => ({
        tempId: subcategory.tempId,
        id: subcategory.id,
        name: subcategory.name,
        originalName: subcategory.originalName,
        isActive: subcategory.isActive,
        originalIsActive: subcategory.originalIsActive,
        markedForDeletion: subcategory.markedForDeletion,
      })),
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

  return (
    <Modal
      isOpen
      onClose={isSaving ? () => {} : onCancel}
      maxWidth="max-w-lg"
    >
      <div style={{ padding: 'var(--admin-space-lg)' }}>
        <CategoryFormHeader title={title} onCancel={onCancel} />

        {editor.kind === 'edit-category' && category && (
          <CategoryCurrentState category={category} />
        )}

        <CategoryFormFields
          editor={editor}
          category={category}
          isNew={isNew}
          isSubcategoryEditor={isSubcategoryEditor}
          name={name}
          onNameChange={setName}
          singleSubName={singleSubName}
          onSingleSubNameChange={setSingleSubName}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          note={note}
          onNoteChange={setNote}
          totalPositions={totalPositions}
          subcategoryManager={subcategoryManager}
        />

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 'var(--admin-space-xs)',
            marginTop: 'var(--admin-space-md)',
          }}
        >
          <AccentButton
            variant="neutral"
            shape="pill"
            onClick={onCancel}
            ariaLabel="Cancel"
          >
            Cancel
          </AccentButton>

          <AccentButton
            variant="dark"
            shape="pill"
            onClick={() => void handleSubmit()}
            ariaLabel={isSaving ? 'Saving' : 'Request change'}
          >
            {isSaving ? 'Saving…' : 'Request change'}
          </AccentButton>
        </div>
      </div>
    </Modal>
  );
}
