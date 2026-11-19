import Modal from '../../../shared/components/Modal';

type ConfirmModalProps = {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'grey' | 'green';
  reverseActions?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Remove',
  cancelText = 'Cancel',
  variant = 'grey',
  reverseActions = false,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const confirmColor = variant === 'green' ? 'var(--admin-status-green)' : 'var(--admin-text-primary)';

  return (
    <Modal
      isOpen={isOpen}
      onClose={isLoading ? () => {} : onCancel}
      maxWidth="max-w-sm"
    >
      <div className="p-6">
        <h3 className="text-xl font-semibold text-[var(--admin-text-primary)]">{title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-[var(--admin-text-primary)]/70">{message}</p>

        <div className="mt-6 flex gap-3">
          <button
            onClick={reverseActions ? onConfirm : onCancel}
            disabled={isLoading}
            className="flex h-11 flex-1 items-center justify-center border border-transparent bg-[var(--admin-surface-subtle)] text-xs font-semibold text-black/60 transition-colors hover:bg-[var(--admin-surface-subtle)] hover:text-black active:bg-[var(--admin-surface-subtle)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {reverseActions ? confirmText : cancelText}
          </button>
          <button
            onClick={reverseActions ? onCancel : onConfirm}
            disabled={isLoading}
            className="flex h-11 flex-1 items-center justify-center border border-solid text-xs font-semibold text-[var(--admin-bg)] transition-colors disabled:cursor-not-allowed disabled:opacity-60"
            style={{ backgroundColor: confirmColor, borderColor: confirmColor }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = confirmColor;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = confirmColor;
              e.currentTarget.style.color = 'var(--admin-bg)';
            }}
          >
            {isLoading ? (
              <span className="flex items-center gap-1" aria-label="Loading">
                <span className="loading-dot"></span>
                <span className="loading-dot"></span>
                <span className="loading-dot"></span>
              </span>
            ) : reverseActions ? cancelText : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
