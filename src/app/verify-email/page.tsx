'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');
  const [role, setRole] = useState<string | null>(null);
  const verifyCalled = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. No token provided.');
      return;
    }

    // Prevent double execution in React Strict Mode
    if (verifyCalled.current) return;
    verifyCalled.current = true;

    const verifyEmail = async () => {
      try {
        const res = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (res.ok) {
          setStatus('success');
          setMessage('Your email has been successfully verified! You can now log in.');
          if (data.role) setRole(data.role);
        } else {
          setStatus('error');
          setMessage(data.error || 'Verification failed. The link may be expired.');
        }
      } catch (error) {
        setStatus('error');
        setMessage('An unexpected error occurred. Please try again later.');
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
        
        {/* LOADING STATE */}
        {status === 'loading' && (
          <div className="flex flex-col items-center py-8">
            <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-6"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying...</h2>
            <p className="text-gray-600">Please wait while we verify your email address.</p>
          </div>
        )}

        {/* SUCCESS STATE */}
        {status === 'success' && (
          <div className="flex flex-col items-center animate-fade-in py-4">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 border-4 border-green-100">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Email Verified!</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">{message}</p>
            
            <div className="w-full space-y-3">
              <Link
                href={role ? `/${role}/login` : '/'}
                className="block w-full bg-gray-900 text-white rounded-xl py-3.5 font-semibold text-lg hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200"
              >
                {role ? 'Continue to Login' : 'Go to Home & Login'}
              </Link>
            </div>
          </div>
        )}

        {/* ERROR STATE */}
        {status === 'error' && (
          <div className="flex flex-col items-center animate-fade-in py-4">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 border-4 border-red-100">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Verification Failed</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">{message}</p>
            
            <div className="w-full space-y-3">
              <Link
                href="/"
                className="block w-full bg-gray-100 text-gray-700 rounded-xl py-3.5 font-semibold text-lg hover:bg-gray-200 transition-colors"
              >
                Return Home
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
