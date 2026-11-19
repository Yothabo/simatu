type AuthErrorScreenProps = {
  authError: string;
  onRetry: () => void;
  onLogout: () => void;
};

export function AdminVerificationErrorScreen({
  authError,
  onRetry,
  onLogout,
}: AuthErrorScreenProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6">
      <div className="w-full max-w-sm text-center">
        <h1 className="font-heading text-3xl italic text-[#4d4d4d]">
          Verification Unavailable
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[#4d4d4d]/70">
          {authError}
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 h-11 w-full border border-solid border-[#4d4d4d] bg-[#4d4d4d] text-xs font-semibold text-white hover:bg-transparent hover:text-[#4d4d4d]"
        >
          Retry Verification
        </button>
        <button
          type="button"
          onClick={onLogout}
          className="mt-3 h-11 w-full border border-solid border-[#4d4d4d]/30 bg-transparent text-xs font-semibold text-[#4d4d4d] hover:bg-[#f5f5f5]"
        >
          Log Out
        </button>
      </div>
    </main>
  );
}

type AccessDeniedScreenProps = {
  onLogout: () => void;
};

export function AdminAccessDeniedScreen({
  onLogout,
}: AccessDeniedScreenProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6">
      <div className="w-full max-w-sm text-center">
        <h1 className="font-heading text-3xl italic text-[#4d4d4d]">
          Access Denied
        </h1>
        <p className="mt-2 text-sm text-[#4d4d4d]/60">
          This account is not authorized for admin access.
        </p>
        <button
          type="button"
          onClick={onLogout}
          className="mt-6 h-11 w-full border border-solid border-[#4d4d4d] bg-[#4d4d4d] text-xs font-semibold text-white hover:bg-transparent hover:text-[#4d4d4d]"
        >
          Log Out
        </button>
      </div>
    </main>
  );
}
