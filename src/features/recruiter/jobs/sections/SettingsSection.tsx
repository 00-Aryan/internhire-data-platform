import { SettingsSectionProps } from '../types';

export const SettingsSection = ({ initialJob }: SettingsSectionProps) => {
  return (
    <div className="border border-gray-200 rounded-2xl p-6 bg-white shadow-sm hover:border-green-300 transition-colors">
      <h2 className="text-xl font-bold text-black border-l-4 border-green-500 pl-3 mb-6">
        Additional Contacts
      </h2>
      
      <div className="space-y-6">
        {/* Certificate */}
        {/* <div>
          <label className="flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              name="hasCertificate" 
              value="true"
              defaultChecked={!!initialJob?.hasCertificate}
              className="mr-3 w-4 h-4 text-green-600 focus:ring-green-500 rounded border-gray-300"
            />
            <span className="text-gray-900 text-sm">
              Offer Certificate upon completion
            </span>
          </label>
        </div> */}

        {/* Custom Contact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Custom Contact Phone
            </label>
            <input 
              name="customPhone" 
              type="tel"
              defaultValue={initialJob?.customPhone ?? ''}
              placeholder="Alternative contact number" 
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 bg-white focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none transition text-sm" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Custom Contact Email
            </label>
            <input 
              name="customEmail" 
              type="email"
              defaultValue={initialJob?.customEmail ?? ''}
              placeholder="Alternative email address" 
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 bg-white focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none transition text-sm" 
            />
          </div>
        </div>
      </div>
    </div>
  );
};
