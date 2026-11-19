import AdminConfirmModal from '../../../components/AdminConfirmModal';
import type { CategoryVisibilityConfirmProps } from './types';

export default function CategoryVisibilityConfirm({
  pendingToggle,
  categoryId,
  onChangeStatus,
  onCancel,
  onConfirmComplete,
}: CategoryVisibilityConfirmProps) {
  const isOpen = pendingToggle !== null;

  const title = pendingToggle?.isActive
    ? `Hide ${pendingToggle.kind === 'category' ? 'category' : 'subcategory'}?`
    : `Show ${pendingToggle?.kind === 'category' ? 'category' : 'subcategory'}?`;

  const message = pendingToggle
    ? pendingToggle.isActive
      ? pendingToggle.kind === 'category'
        ? `"${pendingToggle.name}" and its ${pendingToggle.subcategoryCount} subcategor${pendingToggle.subcategoryCount === 1 ? 'y' : 'ies'} will be hidden from the storefront. You can show it again at any time.`
        : `"${pendingToggle.name}" will be hidden from the storefront. You can show it again at any time.`
      : pendingToggle.kind === 'category'
        ? `"${pendingToggle.name}" and its subcategories will be visible on the storefront again.`
        : `"${pendingToggle.name}" will be visible on the storefront again.`
    : '';

  const handleConfirm = () => {
    if (!pendingToggle) return;

    if (pendingToggle.kind === 'category') {
      void onChangeStatus(
        'category',
        categoryId,
        pendingToggle.isActive,
      );
    } else {
      void onChangeStatus(
        'subcategory',
        pendingToggle.id,
        pendingToggle.isActive,
        pendingToggle.categoryId,
      );
    }

    onConfirmComplete();
  };

  return (
    <AdminConfirmModal
      isOpen={isOpen}
      title={title}
      message={message}
      confirmText={pendingToggle?.isActive ? 'Hide' : 'Show'}
      cancelText="Cancel"
      variant="grey"
      onConfirm={handleConfirm}
      onCancel={onCancel}
    />
  );
}
