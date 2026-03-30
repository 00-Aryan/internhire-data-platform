import { TimelineSectionProps } from '../types';

export const TimelineSection = ({ initialJob }: TimelineSectionProps) => {
  const formatDate = (date: string | Date | undefined | null) => {
    if (!date) return '';
    const d = new Date(date);
    return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
  };

  return (
    <div className="border border-gray-200 rounded-2xl p-6 bg-white shadow-sm hover:border-green-300 transition-colors">
      <h2 className="text-xl font-bold text-black border-l-4 border-green-500 pl-3 mb-6">
        Timeline
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Application Deadline */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Application Deadline <span className="text-red-500">*</span>
          </label>
          <input 
            name="deadline"
            type="date"
            required
            defaultValue={formatDate(initialJob?.deadline)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 bg-white focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none transition text-sm"
          />
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Work Start Date
          </label>
          <input 
            name="startDate"
            type="date"
            defaultValue={formatDate(initialJob?.startDate)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 bg-white focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none transition text-sm"
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Work End Date
          </label>
          <input 
            name="endDate"
            type="date"
            defaultValue={formatDate(initialJob?.endDate)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 bg-white focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none transition text-sm"
          />
        </div>
      </div>
    </div>
  );
};
