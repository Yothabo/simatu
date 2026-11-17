import { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import type { AdminLoginFormProps } from './types';

export default function AdminLoginForm({
  email,
  password,
  isLoggingIn,
  onEmailChange,
  onPasswordChange,
  onLogin,
  onForgotPassword,
}: AdminLoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form onSubmit={onLogin} className="flex flex-col gap-5">
      <div className="flex items-center gap-3 border border-[#A39E96]/25 bg-[#24221F]/90 px-4 py-3.5 transition-colors focus-within:border-[#A39E96]/70">
        <input
          type="email"
          required
          value={email}
          onChange={(event) => onEmailChange(event.target.value)}
          placeholder="Email address"
          className="w-full border-0 bg-transparent text-sm font-medium text-[#EDE8E0] outline-none ring-0 placeholder:text-[#A39E96]/60 focus:outline-none focus:ring-0"
        />
      </div>

      <div className="flex items-center gap-3 border border-[#A39E96]/25 bg-[#24221F]/90 px-4 py-3.5 transition-colors focus-within:border-[#A39E96]/70">
        <input
          type={showPassword ? 'text' : 'password'}
          required
          value={password}
          onChange={(event) => onPasswordChange(event.target.value)}
          placeholder="Password"
          className="w-full border-0 bg-transparent text-sm font-medium text-[#EDE8E0] outline-none ring-0 placeholder:text-[#A39E96]/60 focus:outline-none focus:ring-0"
        />

        <button
          type="button"
          onClick={() => setShowPassword((value) => !value)}
          className="flex h-6 w-6 items-center justify-center border-0 bg-transparent p-0 text-[#A39E96]/60 outline-none transition-colors hover:text-[#EDE8E0]"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
        </button>
      </div>

      <div className="mt-2 flex justify-end">
        <button
          type="button"
          onClick={onForgotPassword}
          className="border-0 bg-transparent p-0 text-sm text-[#A39E96]/70 hover:text-[#EDE8E0]"
        >
          Forgot password?
        </button>
      </div>

      <button
        type="submit"
        disabled={isLoggingIn}
        className="mt-4 flex h-12 w-full items-center justify-between border border-[#EDE8E0] bg-[#EDE8E0] px-5 text-xs font-semibold uppercase tracking-[0.16em] text-[#181715] transition-colors duration-300 hover:bg-transparent hover:text-[#EDE8E0] disabled:opacity-50"
      >
        <span>{isLoggingIn ? 'Signing in...' : 'Sign In'}</span>
        <span aria-hidden="true">↗</span>
      </button>
    </form>
  );
}
