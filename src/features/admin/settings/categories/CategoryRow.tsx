import { useState } from 'react';
import { CARD_CHROME } from '../../components/shared/cardChrome';
import type { CategoryRowProps, PendingCategoryToggle } from './category-row/types';
import CategoryRowHeader from './category-row/CategoryRowHeader';
import CategorySubcategoryList from './category-row/CategorySubcategoryList';
import CategoryVisibilityConfirm from './category-row/CategoryVisibilityConfirm';

export default function CategoryRow({
  category,
  onChangeStatus,
  onEditCategory,
  onMoveToPosition,
  groupPosition,
  groupSize,
}: CategoryRowProps) {
  const [pendingToggle, setPendingToggle] =
    useState<PendingCategoryToggle>(null);

  const requestCategoryToggle = () => {
    setPendingToggle({
      kind: 'category',
      name: category.name,
      isActive: category.is_active,
      subcategoryCount: category.subcategories.length,
    });
  };

  return (
    <div
      className="admin-card-bg overflow-hidden"
      style={{
        ...CARD_CHROME,
        opacity: category.is_active ? 1 : 0.5,
        transition: 'opacity 200ms ease',
      }}
    >
      <CategoryRowHeader
        category={category}
        groupPosition={groupPosition}
        groupSize={groupSize}
        onMoveToPosition={onMoveToPosition}
        onEditCategory={onEditCategory}
        onRequestToggle={requestCategoryToggle}
      />

      <CategorySubcategoryList
        subcategories={category.subcategories}
      />

      <CategoryVisibilityConfirm
        pendingToggle={pendingToggle}
        categoryId={category.id}
        onChangeStatus={onChangeStatus}
        onCancel={() => setPendingToggle(null)}
        onConfirmComplete={() => setPendingToggle(null)}
      />
    </div>
  );
}
