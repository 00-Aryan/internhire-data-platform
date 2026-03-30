'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface CompanyProfileFormProps {
  establishment: {
    type: string;
    name: string;
    website?: string | null;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    city?: string | null;
    district?: string | null;
    state?: string | null;
    cin?: string | null;
    gst?: string | null;
  };
}

export default function CompanyProfileForm({ establishment }: CompanyProfileFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: establishment.type || 'COMPANY_PVT_LTD',
    name: establishment.name || '',
    website: establishment.website || '',
    phone: establishment.phone || '',
    email: establishment.email || '',
    address: establishment.address || '',
    city: establishment.city || '',
    district: establishment.district || '',
    state: establishment.state || '',
    cin: establishment.cin || '',
    gst: establishment.gst || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      type: formData.type,
      name: formData.name,
      website: formData.website.trim() || null,
      phone: formData.phone.trim() || null,
      email: formData.email.trim() || null,
      address: formData.address.trim() || null,
      city: formData.city.trim() || null,
      district: formData.district.trim() || null,
      state: formData.state.trim() || null,
      cin: formData.cin.trim() || null,
      gst: formData.gst.trim() || null,
    };

    try {
      const res = await fetch('/api/recruiter/company', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success('Company details updated successfully!');
        router.refresh();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to update company details');
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
        Company / Organization Details
      </h2>

      {/* Basic Organization Info */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Basic Organization Info</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="company-name" className="block text-sm font-medium text-gray-700 mb-1">Organization Name *</label>
            <input
              name="name"
              id="company-name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label htmlFor="company-type" className="block text-sm font-medium text-gray-700 mb-1">Organization Type *</label>
            <select
              name="type"
              id="company-type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="SCHOOL">School</option>
              <option value="COLLEGE">College</option>
              <option value="UNIVERSITY">University</option>
              <option value="INSTITUTE">Institute</option>
              <option value="COMPANY_PVT_LTD">Company (Pvt Ltd)</option>
              <option value="COMPANY_LLP">Company (LLP)</option>
              <option value="PROPRIETORSHIP">Proprietorship</option>
              <option value="FREELANCER">Freelancer</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contact Details */}
      <div className="mb-6 border-t border-gray-100 pt-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Contact Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="company-website" className="block text-sm font-medium text-gray-700 mb-1">Website</label>
            <input
              name="website"
              id="company-website"
              type="url"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://example.com"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label htmlFor="company-email" className="block text-sm font-medium text-gray-700 mb-1">Official Email</label>
            <input
              name="email"
              id="company-email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label htmlFor="company-phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              name="phone"
              id="company-phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="mb-6 border-t border-gray-100 pt-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Location</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="company-address" className="block text-sm font-medium text-gray-700 mb-1">Detailed Address</label>
            <textarea
              name="address"
              id="company-address"
              rows={3}
              value={formData.address}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="company-city" className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                name="city"
                id="company-city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label htmlFor="company-district" className="block text-sm font-medium text-gray-700 mb-1">District</label>
              <input
                name="district"
                id="company-district"
                value={formData.district}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label htmlFor="company-state" className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input
                name="state"
                id="company-state"
                value={formData.state}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Legal Information */}
      <div className="mb-6 border-t border-gray-100 pt-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Legal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="company-cin" className="block text-sm font-medium text-gray-700 mb-1">CIN (Corporate ID Number)</label>
            <input
              name="cin"
              id="company-cin"
              value={formData.cin}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label htmlFor="company-gst" className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
            <input
              name="gst"
              id="company-gst"
              value={formData.gst}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving Changes...' : 'Update Company Details'}
        </button>
      </div>
    </form>
  );
}