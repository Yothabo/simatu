import type { CategorySubcategoryManagerProps } from './types';
import ExistingSubcategories from './ExistingSubcategories';
import NewSubcategories from './NewSubcategories';

export default function CategorySubcategoryManager({
  editor,
  newSubcategories,
  existingSubcategories,
  onAdd,
  onUpdateNew,
  onRemoveNew,
  onUpdateExisting,
  onToggleExistingStatus,
  onMarkExistingForDeletion,
}: CategorySubcategoryManagerProps) {
  const isNew = editor.kind === 'new-category';
  const isEditing = editor.kind === 'edit-category';

  return (
    <>
      {isEditing && (
        <ExistingSubcategories
          existingSubcategories={existingSubcategories}
          onUpdateExisting={onUpdateExisting}
          onToggleExistingStatus={onToggleExistingStatus}
          onMarkExistingForDeletion={onMarkExistingForDeletion}
        />
      )}

      {isNew && (
        <NewSubcategories
          newSubcategories={newSubcategories}
          onAdd={onAdd}
          onUpdateNew={onUpdateNew}
          onRemoveNew={onRemoveNew}
        />
      )}
    </>
  );
}
