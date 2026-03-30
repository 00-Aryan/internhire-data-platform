// src/features/recruiter/company/sections/ContactDetailsSection.tsx
import React from 'react';

interface ContactDetailsSectionProps {
  formData: {
    website: string;
    email: string;
    phone: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ContactDetailsSection({ formData, handleChange }: ContactDetailsSectionProps) {
  return (
    <div className="border border-gray-200 rounded-2xl p-6 bg-white shadow-sm hover:border-green-300 transition-colors">
      <h2 className="text-xl font-bold text-black border-l-4 border-green-500 pl-3 mb-6">
        Contact Details
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="company-website" className="block text-sm font-medium text-gray-700 mb-1">Official Website</label>
          <input
            id="company-website"
            name="website"
            type="url"
            placeholder="https://example.com"
            value={formData.website}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div>
          <label htmlFor="company-email" className="block text-sm font-medium text-gray-700 mb-1">Official Email</label>
          <input
            id="company-email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div>
          <label htmlFor="company-phone" className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
          <input
            id="company-phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>
    </div>
  );
}