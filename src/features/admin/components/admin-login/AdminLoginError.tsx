type AdminLoginErrorProps = {
  message: string;
  onClose: () => void;
};

export default function AdminLoginError({
  message,
  onClose,
}: AdminLoginErrorProps) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[#181715]/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm border border-[#A39E96]/25 bg-[#24221F] p-6 text-[#EDE8E0] shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="font-heading text-2xl italic text-[#EDE8E0]">
          Login Failed
        </h2>

        <p className="mt-3 text-sm leading-relaxed text-[#A39E96]">
          {message}
        </p>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 flex h-11 w-full items-center justify-center border border-[#EDE8E0] bg-[#EDE8E0] text-xs font-semibold uppercase tracking-wider text-[#181715] hover:bg-transparent hover:text-[#EDE8E0]"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
