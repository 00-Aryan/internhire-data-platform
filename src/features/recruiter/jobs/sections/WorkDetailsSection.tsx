import { WorkDetailsSectionProps } from '../types';

export const WorkDetailsSection = ({ initialJob }: WorkDetailsSectionProps) => {
  return (
    <div className="border border-gray-200 rounded-2xl p-6 bg-white shadow-sm hover:border-green-300 transition-colors">
      <h2 className="text-xl font-bold text-black border-l-4 border-green-500 pl-3 mb-6">
        Work Details
      </h2>
      
      <div className="space-y-5">
        {/* Work Mode */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Work Mode <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select 
              name="workMode"
              required
              defaultValue={initialJob?.workMode ?? 'IN_OFFICE'}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 bg-white focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none transition text-sm appearance-none cursor-pointer"
            >
              <option value="IN_OFFICE">In Office</option>
              <option value="HYBRID">Hybrid</option>
              <option value="REMOTE_ANYWHERE">Remote - Anywhere</option>
              <option value="REMOTE_SPECIFIC_CITY">Remote - Specific City</option>
              <option value="FIELD_WORK">Field Work</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Office Days Per Week */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Work days per week
          </label>
          <input 
            name="officeDaysPerWeek"
            type="number"
            min="0"
            max="7"
            defaultValue={initialJob?.officeDaysPerWeek ?? ''}
            placeholder="e.g. 5"
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 bg-white focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none transition text-sm"
          />
        </div>
      </div>
    </div>
  );
};
