// src/features/recruiter/company/sections/LocationSection.tsx
import React from 'react';

interface LocationSectionProps {
  formData: {
    address: string;
    city: string;
    district: string;
    state: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export default function LocationSection({ formData, handleChange }: LocationSectionProps) {
  return (
    <div className="border border-gray-200 rounded-2xl p-6 bg-white shadow-sm hover:border-green-300 transition-colors">
      <h2 className="text-xl font-bold text-black border-l-4 border-green-500 pl-3 mb-6">
        Location
      </h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="company-address" className="block text-sm font-medium text-gray-700 mb-1">Detailed Address</label>
          <textarea
            id="company-address"
            name="address"
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
              id="company-city"
              name="city"
              type="text"
              value={formData.city}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label htmlFor="company-district" className="block text-sm font-medium text-gray-700 mb-1">District</label>
            <input
              id="company-district"
              name="district"
              type="text"
              value={formData.district}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label htmlFor="company-state" className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <input
              id="company-state"
              name="state"
              type="text"
              value={formData.state}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}