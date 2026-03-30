import { getSessionUser } from '@/core/auth/authUtils';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/infra/db/prisma.client';
import ApplicationCard from '@/shared/components/ApplicationCard';

export default async function MyApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  // Auth
  const user = await getSessionUser();
  if (!user || !user.candidateProfile) {
    redirect('/auth/login');
  }

  const profile = user.candidateProfile;

  // Pagination
  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const perPage = 10;
  const skip = (page - 1) * perPage;

  const [applications, totalCount] = await Promise.all([
    prisma.application.findMany({
      where: { candidateId: profile.id },
      include: {
        job: {
          include: {
            recruiter: {
              include: { establishment: true },
            },
          },
        },
      },
      orderBy: { appliedAt: 'desc' },
      take: perPage,
      skip,
    }),
    prisma.application.count({
      where: { candidateId: profile.id },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / perPage);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">My Applications</h1>
      </div>

      {/* Applications */}
      <div className="space-y-6">
        {applications.map((application) => {
          const job = application.job;

          const meta = [
            job.locationCity || 'Remote',
            job.type === 'INTERNSHIP_FULL_TIME'
              ? 'Full-time'
              : job.type === 'INTERNSHIP_PART_TIME'
              ? 'Part-time'
              : (job.type || '').replace(/_/g, ' '),
            job.isPaid
              ? `₹ ${job.stipendAmount || 5000} per month`
              : 'Unpaid',
          ].join(' | ');

          return (
            <ApplicationCard
              key={application.id}
              title={job.title}
              company={job.recruiter.establishment.name || 'Confidential'}
              meta={meta}
              status={application.status}
              appliedAt={application.appliedAt}
            />
          );
        })}

        {/* Empty state */}
        {applications.length === 0 && totalCount === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">
              You haven&apos;t applied to any internships yet.
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Visit “Explore Internships” to start applying!
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-10">
          {page > 1 && (
            <Link
              href={`/candidate/application?page=${page - 1}`}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              ← Previous
            </Link>
          )}

          <span className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium">
            Page {page} of {totalPages}
          </span>

          {page < totalPages && (
            <Link
              href={`/candidate/application?page=${page + 1}`}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Next →
            </Link>
          )}
        </div>
      )}

      {/* Count */}
      {totalCount > 0 && (
        <div className="text-center mt-4 text-sm text-gray-600">
          Showing {skip + 1}-{Math.min(skip + perPage, totalCount)} of{' '}
          {totalCount} applications
        </div>
      )}
    </div>
  );
}
