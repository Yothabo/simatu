import { useEffect, type FormEvent, type ReactNode } from 'react';
import { FiX } from 'react-icons/fi';
import Modal from '../../../components/Modal';

type AdminFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  onSubmit: () => void;
  submitLabel: string;
  submitLabelLoading?: string;
  cancelLabel?: string;
  isSubmitting: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: ReactNode;
};

const MAX_WIDTH: Record<NonNullable<AdminFormModalProps['size']>, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export default function AdminFormModal({
  isOpen,
  onClose,
  title,
  onSubmit,
  submitLabel,
  submitLabelLoading = 'Saving…',
  cancelLabel = 'Cancel',
  isSubmitting,
  size = 'md',
  children,
}: AdminFormModalProps) {
  // Escape key already handled by Modal component. This is just for belt-and-braces.
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, isSubmitting, onClose]);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isSubmitting) return;
    onSubmit();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={isSubmitting ? () => {} : onClose}
      maxWidth={MAX_WIDTH[size]}
      scrollable={false}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '85vh',
          backgroundColor: 'var(--admin-surface)',
          borderRadius: 'var(--ds-radius-lg)',
          overflow: 'hidden',
        }}
      >
        {/* Header — sticky */}
        <div
          className="flex items-center justify-between"
          style={{
            padding: 'var(--admin-space-md) var(--admin-space-lg)',
            borderBottom: '1px solid var(--admin-border-subtle)',
            flexShrink: 0,
            backgroundColor: 'var(--admin-surface)',
            position: 'sticky',
            top: 0,
            zIndex: 2,
          }}
        >
          <h2
            style={{
              fontSize: 'var(--admin-size-section-title)',
              fontWeight: 'var(--admin-weight-semibold)',
              color: 'var(--admin-text-primary)',
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={isSubmitting ? undefined : onClose}
            disabled={isSubmitting}
            aria-label="Close"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--ds-radius-md)',
              border: 'none',
              background: 'transparent',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              color: 'var(--admin-text-tertiary)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: isSubmitting ? 0.5 : 1,
            }}
          >
            <FiX size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Body — scrollable */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--admin-space-md)',
            padding: 'var(--admin-space-lg)',
            overflowY: 'auto',
            flex: 1,
            minHeight: 0,
          }}
        >
          {children}
        </div>

        {/* Footer — sticky */}
        <div
          className="flex items-center justify-end"
          style={{
            padding: 'var(--admin-space-md) var(--admin-space-lg)',
            borderTop: '1px solid var(--admin-border-subtle)',
            flexShrink: 0,
            gap: 'var(--admin-space-xs)',
            backgroundColor: 'var(--admin-surface)',
            position: 'sticky',
            bottom: 0,
            zIndex: 2,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              height: '44px',
              paddingInline: 'var(--admin-space-lg)',
              borderRadius: 'var(--ds-radius-xl)',
              border: '1px solid var(--admin-border-strong)',
              backgroundColor: 'var(--admin-surface)',
              color: 'var(--admin-text-secondary)',
              fontSize: 'var(--admin-size-supporting)',
              fontWeight: 'var(--admin-weight-medium)',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.5 : 1,
            }}
          >
            {cancelLabel}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              height: '44px',
              paddingInline: 'var(--admin-space-lg)',
              borderRadius: 'var(--ds-radius-xl)',
              border: '1px solid var(--admin-text-primary)',
              backgroundColor: 'var(--admin-text-primary)',
              color: 'var(--admin-bg)',
              fontSize: 'var(--admin-size-supporting)',
              fontWeight: 'var(--admin-weight-medium)',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.5 : 1,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--admin-space-xs)',
              minWidth: '120px',
            }}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-1">
                <span className="loading-dot"></span>
                <span className="loading-dot"></span>
                <span className="loading-dot"></span>
              </span>
            ) : (
              submitLabel
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
