'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface RecruiterAccountFormProps {
  user: {
    name: string;
    email: string;
    phone: string;
  };
}

export default function RecruiterAccountForm({ user }: RecruiterAccountFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    
    const payload: Record<string, any> = {
      name: formData.get('name'),
      phone: formData.get('phone'),
    };

    const password = formData.get('password');
    if (password && typeof password === 'string' && password.trim() !== '') {
      payload.password = password;
    }

    try {
      const res = await fetch('/api/recruiter/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success('Account updated successfully!');
        router.refresh();
        // Clear password field on success
        const form = e.target as HTMLFormElement;
        const passwordInput = form.elements.namedItem('password') as HTMLInputElement;
        if (passwordInput) passwordInput.value = '';
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to update account');
      }
    } catch (error) {
      toast.error('An error occurred while updating account');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border border-gray-200 rounded-2xl p-6 bg-white shadow-sm hover:border-green-300 transition-colors">
      <h2 className="text-xl font-bold text-black border-l-4 border-green-500 pl-3 mb-6">
        Account Information
      </h2>

      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
          <input
            name="name"
            id="name"
            defaultValue={user.name}
            required
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email (Read Only)</label>
          <input
            id="email"
            disabled
            value={user.email}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed outline-none"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
          <input
            name="phone"
            id="phone"
            type="tel"
            defaultValue={!user.phone || user.phone.startsWith('temp-') ? '' : user.phone}
            required
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Change Password</label>
          <input
            name="password"
            id="password"
            type="password"
            placeholder="Leave blank to keep current password"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <p className="text-xs text-gray-500 mt-2">Only fill this if you want to change your password</p>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving Changes...' : 'Update Account'}
          </button>
        </div>
      </div>
    </form>
  );
}