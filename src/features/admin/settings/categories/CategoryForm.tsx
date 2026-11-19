import Modal from '../../../../shared/components/Modal';
import AccentButton from '../../components/AccentButton';
import CategoryFormHeader from './category-form/CategoryFormHeader';
import CategoryCurrentState from './category-form/CategoryCurrentState';
import CategoryFormFields from './category-form/CategoryFormFields';
import { useCategoryFormState } from './useCategoryFormState';
import type { CategoryFormProps } from './category-form/types';

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
  const {
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
  } = useCategoryFormState({
    editor,
    category,
    totalPositions,
    initialSortOrder,
    onSubmit,
  });

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
