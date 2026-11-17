import Modal from '../Modal';

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
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f5f5f5]">
          <span className="font-heading text-xl text-[#8a7770]">!</span>
        </div>

        <h2 className="mt-5 font-heading text-xl font-semibold text-[#4d4d4d]">
          Order not submitted
        </h2>

        <p role="alert" className="mt-3 font-heading text-sm leading-6 text-[#4d4d4d]/65">
          {submitError}
        </p>

        <button
          type="button"
          onClick={onClose}
          className="mt-7 flex h-12 w-full items-center justify-center bg-[#4d4d4d] font-heading text-base text-white transition-colors hover:bg-[#3b3b3b]"
        >
          Close
        </button>
      </div>
    </Modal>
  );
}
