'use client';

import { useState } from 'react';
import { ROLE_MAP, UiRole } from '@/core/auth/roleMap';

interface SignupModalProps {
  role: UiRole; // 'candidate' | 'recruiter'
  onClose: () => void;
  onLogin: () => void;
  onSuccess: (data: any) => void;
}

export default function SignupModal({
  role,
  onClose,
  onLogin,
  onSuccess,
}: SignupModalProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const apiRole = ROLE_MAP[role];

      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          password: formData.password,
          role: apiRole,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      onSuccess(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-md w-full">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
          aria-label="Close"
        >
          ×
        </button>

        {/* Header */}
        <h2 className="text-3xl font-semibold text-gray-900 mb-6 text-center">
          {role === 'candidate' ? 'Candidate' : 'Recruiter'} Signup
        </h2>

        {/* Tabs */}
        <div className="flex rounded-md overflow-hidden mb-6">
          <button
            type="button"
            className="flex-1 py-3 text-sm font-medium bg-gray-900 text-white"
          >
            Sign up
          </button>
          <button
            type="button"
            onClick={onLogin}
            className="flex-1 py-3 text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
          >
            Log in
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-3">
            <input
              name="firstName"
              placeholder="First name"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="w-1/2 px-4 py-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-800 outline-none"
            />
            <input
              name="lastName"
              placeholder="Last name"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="w-1/2 px-4 py-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-800 outline-none"
            />
          </div>

          <input
            name="email"
            type="email"
            placeholder="Email address"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-800 outline-none"
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-800 outline-none"
          />

          <input
            name="confirmPassword"
            type="password"
            placeholder="Confirm password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-800 outline-none"
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-full font-semibold transition ${
              loading
                ? 'bg-gray-300 text-white cursor-not-allowed'
                : 'bg-gray-900 text-white hover:brightness-110'
            }`}
          >
            {loading ? 'Creating account...' : 'Sign up'}
          </button>
        </form>
      </div>
    </div>
  );
}
