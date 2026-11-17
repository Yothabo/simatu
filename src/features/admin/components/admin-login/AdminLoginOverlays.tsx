import ForgotPasswordModal from '../../../../components/ForgotPasswordModal';
import AdminLoginError from './AdminLoginError';

type AdminLoginOverlaysProps = {
  isForgotMode: boolean;
  loginError: string | null;
  email: string;
  onCloseForgotPassword: () => void;
  onClearLoginError: () => void;
};

export default function AdminLoginOverlays({
  isForgotMode,
  loginError,
  email,
  onCloseForgotPassword,
  onClearLoginError,
}: AdminLoginOverlaysProps) {
  return (
    <>
      <ForgotPasswordModal
        isOpen={isForgotMode}
        onClose={onCloseForgotPassword}
        initialEmail={email}
      />

      {loginError && (
        <AdminLoginError
          message={loginError}
          onClose={onClearLoginError}
        />
      )}
    </>
  );
}
