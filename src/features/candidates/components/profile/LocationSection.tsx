'use client';

interface Props {
  city: string | null;
  district: string | null;
  state: string | null;
}

export default function LocationSection({
  city,
  district,
  state,
}: Props) {
  return (
    <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
      <h2 className="text-lg font-semibold text-black">
        Location
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          name="city"
          placeholder="City"
          defaultValue={city || ''}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <input
          name="district"
          placeholder="District"
          defaultValue={district || ''}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <input
          name="state"
          placeholder="State"
          defaultValue={state || ''}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
    </section>
  );
}
