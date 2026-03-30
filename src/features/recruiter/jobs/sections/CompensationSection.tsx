import { CompensationSectionProps } from '../types';

export const CompensationSection = ({
  isPaid,
  setIsPaid,
  initialJob,
}: CompensationSectionProps) => {
  return (
    <div className="border border-gray-200 rounded-2xl p-6 bg-white shadow-sm hover:border-green-300 transition-colors">
      <h2 className="text-xl font-bold text-black border-l-4 border-green-500 pl-3 mb-6">
        Compensation
      </h2>
      
      <div className="space-y-5">
        {/* Paid / Unpaid */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Is this a paid position? <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-6">
            <label className="flex items-center cursor-pointer">
              <input 
                type="radio"
                name="isPaid"
                value="true"
                checked={isPaid}
                onChange={() => setIsPaid(true)}
                className="mr-2 w-4 h-4 text-green-600 focus:ring-green-500"
              />
              <span className="text-gray-900 text-sm">Paid</span>
            </label>

            <label className="flex items-center cursor-pointer">
              <input 
                type="radio"
                name="isPaid"
                value="false"
                checked={!isPaid}
                onChange={() => setIsPaid(false)}
                className="mr-2 w-4 h-4 text-green-600 focus:ring-green-500"
              />
              <span className="text-gray-900 text-sm">Unpaid</span>
            </label>
          </div>
        </div>

        {/* Paid Fields */}
        {isPaid && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Stipend Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Stipend Amount (₹)
              </label>
              <input 
                name="stipendAmount"
                type="number"
                defaultValue={initialJob?.stipendAmount ?? ''}
                placeholder="e.g. 5000"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 bg-white focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none transition text-sm"
              />
            </div>

            {/* Frequency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Select Compensation Duration / Frequency
              </label>
              <div className="relative">
                <select 
                  name="stipendFrequency"
                  defaultValue={initialJob?.stipendFrequency ?? ''}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 bg-white focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none transition text-sm appearance-none cursor-pointer"
                >
                  <option value="">Select</option>
                  <option value="MONTHLY">Monthly</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="ONE_TIME">One Time</option>
                  <option value="PERFORMANCE_BASED">Performance Based</option>
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
          </div>
        )}
      </div>
    </div>
  );
};
