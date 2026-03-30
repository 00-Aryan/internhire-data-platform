'use client';

import { useState } from 'react';

type Role = 'candidate' | 'recruiter' 

interface ForgotPasswordModalProps {
  role: Role;
  onClose: () => void;
  onBackToLogin: () => void;
}

export default function ForgotPasswordModal({
  role,
  onClose,
  onBackToLogin,
}: ForgotPasswordModalProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setStatus('success');
    } catch (err: unknown) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-md w-full">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
          aria-label="Close"
        >
          ×
        </button>

        {status === 'success' ? (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Check your email
            </h2>
            <p className="mt-3 text-gray-600 text-sm">
              If an account exists for <strong>{email}</strong>, we’ve sent a
              password reset link.
            </p>

            <button
              onClick={onBackToLogin}
              className="mt-6 text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 text-center">
              Forgot your password?
            </h2>

            <p className="text-sm text-center text-gray-600 mb-6">
              Enter your email to reset your <span className="capitalize">{role}</span> account password.
            </p>

            {status === 'error' && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 text-center">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status === 'loading'}
                  className="w-full px-4 py-3 rounded-md border border-gray-300
                    focus:ring-2 focus:ring-gray-800 focus:border-transparent
                    outline-none transition disabled:bg-gray-50"
                  placeholder="Enter your email"
                />
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className={`w-full py-3 rounded-full font-semibold transition-all ${
                  status === 'loading'
                    ? 'bg-gray-300 text-white cursor-not-allowed'
                    : 'bg-gray-900 text-white hover:brightness-110'
                }`}
              >
                {status === 'loading' ? 'Sending…' : 'Send Reset Link'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={onBackToLogin}
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  Back to Login
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
