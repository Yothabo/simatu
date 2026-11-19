import type { Category, Editor } from '../types';

export type NewSubcategory = {
  tempId: string;
  name: string;
};

export type ExistingSubcategory = {
  tempId: string;
  id: string;
  name: string;
  originalName: string;
  isActive: boolean;
  originalIsActive: boolean;
  markedForDeletion: boolean;
};

export type CategoryFormSubmitData = {
  name: string;
  sort_order: number;
  note: string;
  newSubcategories: NewSubcategory[];
  existingSubcategories: ExistingSubcategory[];
};

export type CategoryFormProps = {
  editor: Editor;
  category?: Category | null;
  totalPositions: number;
  initialSortOrder: number;
  isSaving: boolean;
  onSubmit: (data: CategoryFormSubmitData) => Promise<void>;
  onCancel: () => void;
};

export type CategoryFormHeaderProps = {
  title: string;
  onCancel: () => void;
};

export type CategoryCurrentStateProps = {
  category: Category;
};

export type CategorySubcategoryManagerProps = {
  editor: Editor;
  newSubcategories: NewSubcategory[];
  existingSubcategories: ExistingSubcategory[];
  onAdd: () => void;
  onUpdateNew: (tempId: string, value: string) => void;
  onRemoveNew: (tempId: string) => void;
  onUpdateExisting: (tempId: string, value: string) => void;
  onToggleExistingStatus: (tempId: string) => void;
  onMarkExistingForDeletion: (tempId: string) => void;
};

export type CategoryFormFieldsProps = {
  editor: Editor;
  category?: Category | null;
  isNew: boolean;
  isSubcategoryEditor: boolean;
  name: string;
  onNameChange: (value: string) => void;
  singleSubName: string;
  onSingleSubNameChange: (value: string) => void;
  sortOrder: string;
  onSortOrderChange: (value: string) => void;
  note: string;
  onNoteChange: (value: string) => void;
  totalPositions: number;
  subcategoryManager: CategorySubcategoryManagerProps;
};
