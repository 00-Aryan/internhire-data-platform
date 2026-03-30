import BackButton from '@/shared/components/BackButton';

interface InternshipHeaderProps {
  job: any;
}

export default function InternshipHeader({ job }: InternshipHeaderProps) {
  return (
    <div className="mb-8">
      <BackButton />
      <div className="mt-4">
        <h1 className="text-3xl font-bold text-black tracking-tight">
          {job.title}
        </h1>
        <p className="text-gray-500 mt-2 text-lg">
          {job.recruiter.establishment.name}
        </p>
      </div>
    </div>
  );
}
