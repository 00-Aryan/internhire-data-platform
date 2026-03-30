interface InternshipDescriptionProps {
  job: any;
}

export default function InternshipDescription({ job }: InternshipDescriptionProps) {
  return (
    <div className="p-8 border-b border-gray-100">
      <h3 className="text-lg font-bold text-black mb-4">About the Role</h3>
      <p className="text-gray-600 leading-relaxed whitespace-pre-line text-sm">
        {job.description}
      </p>

      {job.domain && (
        <div className="mt-6 inline-flex items-center px-3 py-1 bg-gray-50 border border-gray-200 rounded-full">
          <span className="text-xs text-gray-500 font-medium">
            {job.domain}
          </span>
        </div>
      )}
    </div>
  );
}
