import type { Category } from '../types';

export type PendingCategoryToggle =
  | {
      kind: 'category';
      name: string;
      isActive: boolean;
      subcategoryCount: number;
    }
  | {
      kind: 'subcategory';
      id: string;
      categoryId: string;
      name: string;
      isActive: boolean;
    }
  | null;

export type CategoryRowProps = {
  category: Category;
  onChangeStatus: (
    kind: 'category' | 'subcategory',
    id: string,
    isActive: boolean,
    categoryId?: string,
  ) => Promise<void>;
  onEditCategory: (category: Category) => void;
  onMoveToPosition: (category: Category, position: number) => Promise<void>;
  groupPosition: number;
  groupSize: number;
};

export type CategorySortMenuProps = {
  category: Category;
  groupPosition: number;
  groupSize: number;
  onMoveToPosition: (category: Category, position: number) => Promise<void>;
};

export type CategoryRowHeaderProps = {
  category: Category;
  groupPosition: number;
  groupSize: number;
  onMoveToPosition: (category: Category, position: number) => Promise<void>;
  onEditCategory: (category: Category) => void;
  onRequestToggle: () => void;
};

export type CategoryVisibilityConfirmProps = {
  pendingToggle: PendingCategoryToggle;
  categoryId: string;
  onChangeStatus: CategoryRowProps['onChangeStatus'];
  onCancel: () => void;
  onConfirmComplete: () => void;
};
