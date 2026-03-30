'use client';

import { useState } from 'react';
import { ROLE_MAP, UiRole } from '@/core/auth/roleMap';
import { useNotification } from '@/shared/notifications/useNotification';

interface LoginModalProps {
  role: UiRole; // 'candidate' | 'recruiter'
  onClose: () => void;
  onSignup: () => void;
  onForgotPassword: () => void;
  onSuccessRedirect: (url: string) => void;
}

export default function LoginModal({
  role,
  onClose,
  onSignup,
  onForgotPassword,
  onSuccessRedirect,
}: LoginModalProps) {
  const [formData, setFormData] = useState({
    emailOrPhone: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { showVerificationRequired, showCustomSuccess, showError } = useNotification();

  const isDisabled =
    loading ||
    formData.emailOrPhone.trim() === '' ||
    formData.password.trim() === '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleResendVerification = async (email: string) => {
    try {
      const res = await fetch('/api/auth/verify/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Handle rate limits or other errors from resend API
        showError('Resend Failed', data.error || 'Failed to resend email.');
        return;
      }

      // Success
      showCustomSuccess(
        'Email Sent',
        data.message || 'A new verification email has been sent to your inbox.'
      );
    } catch (err) {
      showError('Error', 'An unexpected error occurred while resending the email.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const apiRole = ROLE_MAP[role]; // 🔑 FIX

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          role: apiRole,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Check for specific verification error
        if (data.code === 'EMAIL_NOT_VERIFIED' && data.email) {
          onClose(); // Close login modal
          showVerificationRequired(
            'Verification Required',
            'Your email is not verified. Please check your inbox or request a new verification link.',
            () => handleResendVerification(data.email)
          );
          return;
        }
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      // 🔑 FIX: delegate redirect to parent (route-aware)
      onSuccessRedirect(data.redirectUrl || '/');

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-md w-full">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
          aria-label="Close"
        >
          ×
        </button>

        {/* Header */}
        <h2 className="text-3xl font-semibold text-gray-900 mb-6 text-center">
          {role === 'candidate' ? 'Candidate' : 'Recruiter'}
        </h2>

        {/* Tabs */}
        <div className="flex rounded-md overflow-hidden mb-8">
          <button
            type="button"
            onClick={onSignup}
            className="flex-1 py-3 text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
          >
            Sign up
          </button>
          <button
            type="button"
            className="flex-1 py-3 text-sm font-medium bg-gray-900 text-white"
          >
            Log in
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div
            className={`text-sm p-3 rounded-lg mb-6 ${
              error.includes('verify') || error.includes('verification')
                ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                : 'bg-red-50 text-red-600'
            }`}
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <input
              name="emailOrPhone"
              type="email"
              required
              className="w-full px-4 py-3 rounded-md border border-gray-300
                focus:ring-2 focus:ring-gray-800 focus:border-transparent
                outline-none transition"
              placeholder="Enter your email"
              value={formData.emailOrPhone}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Set password
            </label>
            <input
              name="password"
              type="password"
              required
              className="w-full px-4 py-3 rounded-md border border-gray-300
                focus:ring-2 focus:ring-gray-800 focus:border-transparent
                outline-none transition"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
            />
            <div className="flex justify-end mt-1">
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Forgot password?
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isDisabled}
            className={`w-full py-3 rounded-full font-semibold transition-all ${
              isDisabled
                ? 'bg-gray-300 text-white cursor-not-allowed'
                : 'bg-gray-900 text-white hover:brightness-110'
            }`}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
