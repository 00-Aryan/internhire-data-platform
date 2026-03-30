import { getSessionUser } from '@/core/auth/authUtils';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function RecruiterDashboard() {
  const user = await getSessionUser();

  if (!user || !user.recruiterProfile) {
    redirect('/auth/login');
  }

  const profile = user.recruiterProfile;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Greeting */}
      <h1 className="text-4xl font-bold text-black mb-10 tracking-tight">
        Hi, {user.name}
      </h1>

      {/* Grid of Cards - 2x2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Edit Profile Card */}
        <Link href="/recruiter/profile/edit">
          <div className="bg-white border border-gray-200 rounded-3xl p-8 flex items-center cursor-pointer hover:shadow-xl hover:scale-[1.02] hover:border-green-300 transition-all duration-300 group h-40">
            <div className="flex items-center justify-between w-full">
              <h3 className="text-2xl font-bold text-black group-hover:text-green-700 transition-colors">Edit Profile</h3>
              <div className="bg-gray-50 rounded-full w-14 h-14 flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-all duration-300 shadow-sm">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
            </div>
          </div>
        </Link>

        {/* Post Internships Card */}
        <Link href="/recruiter/post-new">
          <div className="bg-white border border-gray-200 rounded-3xl p-8 flex items-center cursor-pointer hover:shadow-xl hover:scale-[1.02] hover:border-green-300 transition-all duration-300 group h-40">
            <div className="flex items-center justify-between w-full">
              <h3 className="text-2xl font-bold text-black group-hover:text-green-700 transition-colors">Post Internships</h3>
              <div className="bg-gray-50 rounded-full w-14 h-14 flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-all duration-300 shadow-sm">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
            </div>
          </div>
        </Link>

        {/* View Applications Card */}
        <Link href="/recruiter/posted-jobs">
          <div className="bg-white border border-gray-200 rounded-3xl p-8 flex items-center cursor-pointer hover:shadow-xl hover:scale-[1.02] hover:border-green-300 transition-all duration-300 group h-40">
            <div className="flex items-center justify-between w-full">
              <h3 className="text-2xl font-bold text-black group-hover:text-green-700 transition-colors">View applications</h3>
              <div className="bg-gray-50 rounded-full w-14 h-14 flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-all duration-300 shadow-sm">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>
        </Link>

        {/* Plans Card */}
        <Link href="/recruiter/subscription">
          <div className="bg-white border border-gray-200 rounded-3xl p-8 flex items-center cursor-pointer hover:shadow-xl hover:scale-[1.02] hover:border-green-300 transition-all duration-300 group h-40">
            <div className="flex items-center justify-between w-full">
              <h3 className="text-2xl font-bold text-black group-hover:text-green-700 transition-colors">Plans</h3>
              <div className="bg-gray-50 rounded-full w-14 h-14 flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-all duration-300 shadow-sm">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}