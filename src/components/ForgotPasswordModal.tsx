import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import Modal from '../shared/components/Modal';

type ForgotPasswordModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initialEmail?: string;
};

export default function ForgotPasswordModal({ isOpen, onClose, initialEmail = '' }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState(initialEmail);
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showErrorState, setShowErrorState] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEmail(initialEmail);
      setSent(false);
      setError(null);
      setShowErrorState(false);
    }
  }, [isOpen, initialEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    setIsSending(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/update-password`,
    });
    setIsSending(false);
    if (resetError) {
      setError(resetError.message);
      setShowErrorState(true);
    } else {
      setSent(true);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-sm">
      <div className="p-6">
        {showErrorState ? (
          <>
            <h2 className="text-xl font-semibold text-[#4d4d4d]">Something went wrong</h2>
            <p className="mt-3 text-sm leading-relaxed text-[#4d4d4d]/70">{error}</p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => { setShowErrorState(false); setError(null); }}
                className="flex h-12 flex-1 items-center justify-center border border-[#4d4d4d]/20 bg-transparent text-sm font-medium text-[#4d4d4d] hover:bg-[#4d4d4d]/5"
              >
                Try Again
              </button>
              <button
                onClick={onClose}
                className="flex h-12 flex-1 items-center justify-center border-0 bg-[#8aa89b] text-sm font-medium text-white hover:opacity-90"
              >
                Close
              </button>
            </div>
          </>
        ) : sent ? (
          <>
            <h2 className="font-heading text-2xl italic text-[#4d4d4d]">Check your email</h2>
            <p className="mt-3 text-sm leading-relaxed text-[#4d4d4d]/70">
              If an account exists with that email, we've sent a password reset link.
            </p>
            <button
              onClick={onClose}
              className="mt-6 flex h-12 w-full items-center justify-center border-0 bg-[#8aa89b] text-sm font-medium text-white hover:opacity-90"
            >
              Close
            </button>
          </>
        ) : (
          <>
            <h2 className="font-heading text-2xl italic text-[#4d4d4d]">Forgot password?</h2>
            <p className="mt-2 text-sm leading-relaxed text-[#4d4d4d]/70">
              Enter your email and we'll send you a reset link.
            </p>
            <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full border-0 bg-[#f5f5f5] px-4 py-3 font-heading text-base text-[#4d4d4d] outline-none placeholder:text-[#4d4d4d]/40"
              />
              {error && <p className="text-xs text-red-500">{error}</p>}
              <button
                type="submit"
                disabled={isSending}
                className="mt-2 flex h-12 w-full items-center justify-center border-0 bg-[#8aa89b] text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
              >
                {isSending ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          </>
        )}
      </div>
    </Modal>
  );
}
