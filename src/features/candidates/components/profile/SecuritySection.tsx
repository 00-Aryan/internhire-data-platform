'use client';

export default function SecuritySection() {
  return (
    <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
      <h2 className="text-lg font-semibold text-black">
        Security
      </h2>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Change Password
        </label>
        <input
          name="password"
          type="password"
          placeholder="Leave blank to keep current password"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
    </section>
  );
}
