import Link from 'next/link';
import { getSessionUser } from '@/core/auth/authUtils';

export default async function Navbar() {
  const user = await getSessionUser();

  let homeHref = '/';

  if (user?.activeRole === 'RECRUITER') {
    homeHref = '/recruiter';
  } else if (user?.activeRole === 'CANDIDATE') {
    homeHref = '/candidate';
  }

  return (
    <nav className="bg-black border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-8xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-13">
          {/* Left Side: Logo */}
          <div className="flex items-center">
            <Link href={homeHref} className="flex">
              <span className="text-2xl font-bold text-white">InternHire</span>
            </Link>
          </div>

          {/* Right Side: Navigation Links */}
          <div className="flex items-center"></div>
        </div>
      </div>
    </nav>
  );
}
