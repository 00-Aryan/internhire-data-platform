interface InternshipContactProps {
  job: any;
}

export default function InternshipContact({ job }: InternshipContactProps) {
  return (
    <div className="p-8 bg-gray-50">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-sm font-bold text-black uppercase tracking-wider mb-1">
            Hiring Manager
          </h3>
          <p className="text-gray-900 font-medium">
            {job.recruiter.user.name}
          </p>
          {job.recruiter.designation && (
            <p className="text-gray-500 text-sm">
              {job.recruiter.designation}
            </p>
          )}
        </div>

        <div className="flex gap-4 text-sm">
          {(job.customEmail || job.recruiter.establishment.email) && (
            <a
              href={`mailto:${job.customEmail || job.recruiter.establishment.email}`}
              className="text-gray-600 hover:text-black hover:underline"
            >
              Email
            </a>
          )}

          {job.recruiter.establishment.website && (
            <a
              href={job.recruiter.establishment.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-black hover:underline"
            >
              Website
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
