import AdminProductForm, {
  type AdminProduct,
} from '../../../features/admin/components/AdminProductForm';
import AdminProductDetailsModal from '../../../components/AdminProductDetailsModal';
import ConfirmModal from '../../../components/ConfirmModal';
import type { AdminRow } from '../../../features/admin/types/admin.types';

type AdminRole = 'super_admin' | 'store_admin' | null;

type Props = {
  // Product details modal
  viewingProduct: AdminRow | null;
  onCloseViewingProduct: () => void;
  onEditProduct: (product: AdminProduct) => void;
  onRequestHide: (product: AdminRow) => void;
  onReactivate: (product: AdminRow) => void;
  onRequestPermanentDelete: (product: AdminRow) => void;

  // Product form
  formOpen: boolean;
  editing: AdminProduct | null;
  onCloseForm: () => void;
  onSavedProduct: (product: AdminRow) => void;
  adminRole: AdminRole;
  storeSlug: 'yotaabo' | 'poshies' | null;

  // Hide confirm
  confirmDelete: AdminRow | null;
  isHiding: boolean;
  onConfirmHide: (product: AdminRow) => void;
  onCancelHide: () => void;

  // Permanent delete confirm
  confirmPermanentDelete: AdminRow | null;
  isDeleting: boolean;
  onConfirmPermanentDelete: (product: AdminRow) => void;
  onCancelPermanentDelete: () => void;
};

export default function AdminProductModals({
  viewingProduct,
  onCloseViewingProduct,
  onEditProduct,
  onRequestHide,
  onReactivate,
  onRequestPermanentDelete,
  formOpen,
  editing,
  onCloseForm,
  onSavedProduct,
  adminRole,
  storeSlug,
  confirmDelete,
  isHiding,
  onConfirmHide,
  onCancelHide,
  confirmPermanentDelete,
  isDeleting,
  onConfirmPermanentDelete,
  onCancelPermanentDelete,
}: Props) {
  return (
    <>
      <AdminProductDetailsModal
        product={viewingProduct}
        onClose={onCloseViewingProduct}
        onEdit={onEditProduct}
        onHide={onRequestHide}
        onShow={onReactivate}
        onDelete={onRequestPermanentDelete}
      />

      <AdminProductForm
        isOpen={formOpen}
        onClose={onCloseForm}
        onSaved={onSavedProduct}
        productToEdit={editing}
        adminRole={adminRole}
        storeSlug={storeSlug}
      />

      <ConfirmModal
        isOpen={!!confirmDelete}
        title="Hide product?"
        message={
          confirmDelete
            ? `"${confirmDelete.name}" will be hidden from the site. You can reactivate it later.`
            : ''
        }
        confirmText="Hide"
        cancelText="Cancel"
        variant="grey"
        isLoading={isHiding}
        onConfirm={() => {
          if (confirmDelete) onConfirmHide(confirmDelete);
        }}
        onCancel={() => {
          if (!isHiding) onCancelHide();
        }}
      />

      <ConfirmModal
        isOpen={!!confirmPermanentDelete}
        title="Delete product permanently?"
        message={
          confirmPermanentDelete
            ? `"${confirmPermanentDelete.name}" will be permanently deleted.`
            : ''
        }
        confirmText="Delete"
        cancelText="Cancel"
        variant="grey"
        isLoading={isDeleting}
        onConfirm={() => {
          if (confirmPermanentDelete) {
            onConfirmPermanentDelete(confirmPermanentDelete);
          }
        }}
        onCancel={() => {
          if (!isDeleting) onCancelPermanentDelete();
        }}
      />
    </>
  );
}
