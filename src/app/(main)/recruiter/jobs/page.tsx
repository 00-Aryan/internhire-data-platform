import { getSessionUser } from '@/core/auth/authUtils';
import { prisma } from '@/infra/db/prisma.client';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import SortDropdown from './SortDropdown';

 //////////page not used 

interface PageProps {
  searchParams: Promise<{ sort?: string }>;
}

export default async function RecruiterJobsPage({ searchParams }: PageProps) {
  const user = await getSessionUser();

  if (!user || !user.recruiterProfile) {
    redirect('/auth/login');
  }

  const { sort } = await searchParams;
  const sortOption = sort || 'date_desc';

  // Determine OrderBy Logic
  let orderBy: any = { createdAt: 'desc' }; // Default

  if (sortOption === 'date_asc') {
    orderBy = { createdAt: 'asc' };
  } else if (sortOption === 'applicants_desc') {
    orderBy = { applications: { _count: 'desc' } };
  } else if (sortOption === 'applicants_asc') {
    orderBy = { applications: { _count: 'asc' } };
  }

  const jobs = await prisma.jobListing.findMany({
    where: {
      recruiterId: user.recruiterProfile.id,
    },
    include: {
      _count: {
        select: { applications: true },
      },
    },
    orderBy: orderBy,
  });

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-black tracking-tight">Active Listings</h1>
          <p className="text-gray-500 mt-1">Manage your job posts and view applicant stats.</p>
        </div>
        <SortDropdown />
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <h3 className="text-lg font-medium text-gray-900">No jobs posted yet</h3>
          <p className="text-gray-500 mb-6">Create your first job listing to get started.</p>
          <Link href="/recruiter/post-new" className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium">
            Post a Job
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job) => {
            const daysActive = Math.ceil(
              (new Date().getTime() - new Date(job.createdAt).getTime()) / (1000 * 3600 * 24)
            );

            return (
              <Link 
                key={job.id} 
                href={`/recruiter/jobs/${job.id}`}
                className="block group"
              >
                <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl hover:scale-[1.01] transition-all duration-300 hover:border-green-400 relative overflow-hidden">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    
                    {/* Left: Job Info */}
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-xl font-bold text-black group-hover:text-green-700 transition-colors">
                          {job.title}
                        </h2>
                        <span className={`px-2 py-0.5 text-xs font-bold rounded-full border ${
                          job.status === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-200' :
                          job.status === 'CLOSED' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-yellow-50 text-yellow-700 border-yellow-200'
                        }`}>
                          {job.status}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                          Posted: {new Date(job.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                          Active for {daysActive} days
                        </span>
                      </div>
                    </div>

                    {/* Right: Stats */}
                    <div className="flex items-center gap-6">
                       <div className="text-right">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Candidates</p>
                          <p className="text-2xl font-black text-black group-hover:text-green-700 transition-colors">{job._count.applications}</p>
                       </div>
                       <div className="text-gray-300 group-hover:text-green-600 transition-colors">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                       </div>
                    </div>

                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}