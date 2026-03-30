// src/features/recruiter/company/sections/LegalSection.tsx
import React from 'react';

interface LegalSectionProps {
  formData: {
    cin: string;
    gst: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function LegalSection({ formData, handleChange }: LegalSectionProps) {
  return (
    <div className="border border-gray-200 rounded-2xl p-6 bg-white shadow-sm hover:border-green-300 transition-colors">
      <h2 className="text-xl font-bold text-black border-l-4 border-green-500 pl-3 mb-6">
        Legal Information
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="company-cin" className="block text-sm font-medium text-gray-700 mb-1">CIN (Corporate ID Number)</label>
          <input
            id="company-cin"
            name="cin"
            type="text"
            value={formData.cin}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div>
          <label htmlFor="company-gst" className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
          <input
            id="company-gst"
            name="gst"
            type="text"
            value={formData.gst}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>
    </div>
  );
}