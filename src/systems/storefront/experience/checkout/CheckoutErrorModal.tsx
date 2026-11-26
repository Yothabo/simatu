import Modal from '../../../../shared/components/Modal.tsx';

type CheckoutErrorModalProps = {
  submitError: string;
  onClose: () => void;
};

export default function CheckoutErrorModal({
  submitError,
  onClose,
}: CheckoutErrorModalProps) {
  return (
    <Modal
      isOpen={Boolean(submitError)}
      onClose={onClose}
      maxWidth="max-w-sm"
    >
      <div className="p-6 sm:p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--sf-surface-soft)]">
          <span className="font-heading text-xl text-[var(--sf-accent)]">!</span>
        </div>

        <h2 className="mt-5 font-heading text-xl font-semibold text-[var(--sf-text)]">
          Order not submitted
        </h2>

        <p role="alert" className="mt-3 font-heading text-sm leading-6 text-[var(--sf-text)]/65">
          {submitError}
        </p>

        <button
          type="button"
          onClick={onClose}
          className="mt-7 flex h-12 w-full items-center justify-center bg-[var(--sf-inverse-background)] font-heading text-base text-[var(--sf-accent-contrast)] transition-colors hover:bg-[var(--sf-accent)]"
        >
          Close
        </button>
      </div>
    </Modal>
  );
}
