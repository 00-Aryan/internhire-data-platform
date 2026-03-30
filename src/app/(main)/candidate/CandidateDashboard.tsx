import { getSessionUser } from '@/core/auth/authUtils';
import Link from 'next/link';
import { prisma } from '@/infra/db/prisma.client';
import DashboardActionCard from '@/shared/components/DashboardActionCard';

export default async function CandidateDashboard() {
  // 1. Real Auth

  const user = await getSessionUser();

  if (!user || !user.candidateProfile) {
    throw new Error('CandidateDashboard rendered without candidate layout guard');
  }



  const profile = user.candidateProfile;



  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Greeting */}
      <h1 className="text-4xl font-bold text-black mb-10 tracking-tight">
        Hi, {user.name}
      </h1>

      {/* Industry Readiness Score Card - Catchy Yellow */}
      <Link href="/candidate/industry-readiness">
        <div className="bg-[#FFD941] border-2 border-transparent hover:border-black rounded-3xl p-8 mb-8 flex items-center cursor-pointer hover:shadow-xl hover:scale-[1.01] transition-all duration-300 group">
          <div className="flex items-center justify-between w-full">
            <div>
              <h2 className="text-3xl font-bold text-black mb-2">Industry Readiness Score</h2>
              <p className="text-gray-900 text-lg font-medium">Get your score in 100+ industry specific assessments</p>
            </div>
            <div className="bg-black rounded-full w-14 h-14 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
              <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </Link>

      {/* Grid of Cards - 2x2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Edit Profile Card */}
        <Link href="/candidate/profile/edit">
          <DashboardActionCard
            title="Edit Profile"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536
          L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            }
          />
        </Link>

        {/* Internships Card */}
        <Link href="/candidate/internship">
          <DashboardActionCard
            title="Internships"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            }
          />
        </Link>

        {/* My Applications Card */}
        <Link href="/candidate/application">
          <DashboardActionCard
            title="My applications"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
          />
        </Link>

        {/* Plans Card */}
        <Link href="/candidate/subscription">
          <DashboardActionCard
            title="Plans"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </Link>
      </div>
    </div>
  );
}