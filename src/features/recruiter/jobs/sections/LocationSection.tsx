import { LocationSectionProps } from '../types';

export const LocationSection = ({ initialJob }: LocationSectionProps) => {
  return (
    <div className="border border-gray-200 rounded-2xl p-6 bg-white shadow-sm hover:border-green-300 transition-colors">
      <h2 className="text-xl font-bold text-black border-l-4 border-green-500 pl-3 mb-6">
        Our office Location
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* City */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            City
          </label>
          <input 
            name="locationCity"
            defaultValue={initialJob?.locationCity ?? ''}
            placeholder="e.g. Mumbai"
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 bg-white focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none transition text-sm"
          />
        </div>

        {/* District */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            District
          </label>
          <input 
            name="locationDistrict"
            defaultValue={initialJob?.locationDistrict ?? ''}
            placeholder="e.g. Mumbai Urban"
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 bg-white focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none transition text-sm"
          />
        </div>

        {/* State */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            State
          </label>
          <input 
            name="locationState"
            defaultValue={initialJob?.locationState ?? ''}
            placeholder="e.g. Maharashtra"
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 bg-white focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none transition text-sm"
          />
        </div>
      </div>
    </div>
  );
};
