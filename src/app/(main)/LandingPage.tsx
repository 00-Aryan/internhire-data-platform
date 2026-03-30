'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Lora } from 'next/font/google';

import LoginModal from '@/features/auth/components/modals/LoginModal';
import SignupModal from '@/features/auth/components/modals/SignupModal';
import ForgotPasswordModal from '@/features/auth/components/modals/ForgotPasswordModal';
import { parseAuthRoute } from '@/core/auth/routeUtils';
import { useNotification } from '@/shared/notifications/useNotification';

const lora = Lora({ subsets: ['latin'], style: ['italic'] });

export default function LandingPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { showCustomSuccess } = useNotification();

  const { role, action, isValid } = parseAuthRoute(pathname);

  // 🔒 close = exit auth session, not add history
  const closeModal = () => router.replace('/');

  return (
    <div className="landing-page">
      <div className="max-w-7xl mx-auto px-4 py-12">

        {/* Hero */}
        <header className="text-center mb-32 animate-fade-in">
          <h1 className="mt-15 text-white-200 lg:text-3xl mb-30">
            Internships, Project work, Part-Time jobs
          </h1>

          <h1 className="text-4xl font-bold text-[#FFD941]">
            Industry Readiness Score
          </h1>

          <p className={`mt-6 text-2xl italic text-[#FFD941] ${lora.className}`}>
            Get your score in 100+ industry specific assessments.
          </p>
        </header>

        {/* CTA */}
        <section className="flex flex-col items-center">
          <button
            onClick={() => router.push('/candidate/login')}
            className="w-80 px-8 py-4 rounded-lg border border-white/20
              bg-[#2A2A2A] text-white font-semibold shadow-sm
              transition-all duration-200 ease-in-out
              hover:bg-[#333333] hover:border-white/40 hover:shadow-md
              active:scale-[0.99] cursor-pointer"
          >
            Candidate Login →
          </button>

          <button
            onClick={() => router.push('/recruiter/login')}
            className="group mt-8 px-8 py-4 text-white font-semibold
              transition-colors duration-200 flex items-center gap-2
              hover:text-[#FFD941] cursor-pointer"
          >
            <span className="group-hover:underline underline-offset-4">
              click here for Recruiter Login
            </span>
            <span className="transition-transform duration-200 group-hover:translate-x-1">
              →
            </span>
          </button>
        </section>

        {/* Auth Modals (route-driven) */}
        {isValid && action === 'login' && role && (
          <LoginModal
            role={role}
            onClose={closeModal}
            onSignup={() => router.replace(`/${role}/signup`)}
            onForgotPassword={() => router.replace(`/${role}/forgot-password`)}
            onSuccessRedirect={(url) => router.replace(url)}
          />
        )}

        {isValid && action === 'signup' && role && (
          <SignupModal
            role={role}
            onClose={closeModal}
            onLogin={() => router.replace(`/${role}/login`)}
            onSuccess={(data) => {
              showCustomSuccess(
                'Account Created',
                data?.message || 'User created successfully. Please check your email to verify your account.',
                {},
                () => router.replace(`/${role}/login`)
              );
            }}
          />
        )}

        {isValid && action === 'forgot-password' && role && (
          <ForgotPasswordModal
            role={role}
            onClose={closeModal}
            onBackToLogin={() => router.replace(`/${role}/login`)}
          />
        )}
      </div>
    </div>
  );
}
