import { BasicInfoSectionProps } from '../types';

export const BasicInfoSection = ({ initialJob }: BasicInfoSectionProps) => {
  return (
    <div className="border border-gray-200 rounded-2xl p-6 bg-white shadow-sm hover:border-green-300 transition-colors">
      <h2 className="text-xl font-bold text-black border-l-4 border-green-500 pl-3 mb-6">
        Basic Information
      </h2>

      <div className="space-y-5">
        {/* Job Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Job Title <span className="text-red-500">*</span>
          </label>
          <input
            name="title"
            required
            defaultValue={initialJob?.title ?? ''}
            placeholder="e.g. Data Science Intern"
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 bg-white focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none transition text-sm"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Job Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            required
            rows={6}
            defaultValue={initialJob?.description ?? ''}
            placeholder="Describe the role responsibilities..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 bg-white focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none transition text-sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Job Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Job Type <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                name="type"
                required
                defaultValue={initialJob?.type ?? 'INTERNSHIP_FULL_TIME'}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 bg-white
             focus:ring-1 focus:ring-green-500 focus:border-green-500
             outline-none transition text-sm appearance-none cursor-pointer"
              >
                {/* Internship */}
                <option value="INTERNSHIP_FULL_TIME">
                  Internship (Full Time)
                </option>
                <option value="INTERNSHIP_PART_TIME">
                  Internship (Part Time)
                </option>

                {/* Project Work */}
                <option value="PROJECT_WORK_FULL_TIME">
                  Project Work (Full Time)
                </option>
                <option value="PROJECT_WORK_PART_TIME">
                  Project Work (Part Time)
                </option>
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

          {/* Domain */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Domain/Field
            </label>
            <input
              name="domain"
              defaultValue={initialJob?.domain ?? ''}
              placeholder="e.g. Technology"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 bg-white focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none transition text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
