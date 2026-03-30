'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface RecruiterProfessionalFormProps {
  recruiterProfile: {
    designation: string | null;
    department: string | null;
    profileLink: string | null;
  };
}

export default function RecruiterProfessionalForm({ recruiterProfile }: RecruiterProfessionalFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    designation: recruiterProfile.designation || '',
    department: recruiterProfile.department || '',
    profileLink: recruiterProfile.profileLink || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      designation: formData.designation.trim() || null,
      department: formData.department.trim() || null,
      profileLink: formData.profileLink.trim() || null,
    };

    try {
      const res = await fetch('/api/recruiter/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success('Professional details updated successfully!');
        router.refresh();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to update professional details');
      }
    } catch (error) {
      toast.error('An error occurred while updating details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border border-gray-200 rounded-2xl p-6 bg-white shadow-sm hover:border-green-300 transition-colors">
      <h2 className="text-xl font-bold text-black border-l-4 border-green-500 pl-3 mb-6">
        Professional Details
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label htmlFor="recruiter-designation" className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
          <input
            id="recruiter-designation"
            name="designation"
            value={formData.designation}
            onChange={handleChange}
            placeholder="e.g., HR Manager, Talent Acquisition Lead"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div>
          <label htmlFor="recruiter-department" className="block text-sm font-medium text-gray-700 mb-1">Department</label>
          <input
            id="recruiter-department"
            name="department"
            value={formData.department}
            onChange={handleChange}
            placeholder="e.g., Human Resources, Operations"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      <div className="mb-6">
        <label htmlFor="recruiter-profileLink" className="block text-sm font-medium text-gray-700 mb-1">Profile Link (LinkedIn, etc.)</label>
        <input
          id="recruiter-profileLink"
          name="profileLink"
          type="url"
          value={formData.profileLink}
          onChange={handleChange}
          placeholder="https://linkedin.com/in/username"
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving Changes...' : 'Update Professional Details'}
        </button>
      </div>
    </form>
  );
}