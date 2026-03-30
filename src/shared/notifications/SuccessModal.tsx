'use client';

import React, { useEffect } from 'react';
import { useNotification } from '@/shared/notifications/useNotification';
import { usePathname } from 'next/navigation';

export default function SuccessModal() {
  const { isVisible, type, title, message, metadata, hide, onConfirm, onClose } = useNotification();
  const pathname = usePathname();

  const handleClose = () => {
    hide();
    if (onClose) onClose();
  };

  // Handle ESC key press to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, hide, onClose]);

  // Conditional rendering
  if (!isVisible) return null;

  const isFullScreen = type === 'application_submitted';

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slideUp 0.5s cubic-bezier(0.32, 0.72, 0, 1) forwards;
        }
      `}} />
      <div
        className={`${isFullScreen ? 'fixed inset-0 z-[100]' : 'fixed inset-0 z-[100] bg-gray-900/50 backdrop-blur-sm p-4'
          } flex items-center justify-center transition-opacity duration-300 ${isFullScreen && pathname?.startsWith('/candidate') ? 'md:pl-64' : ''
          }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={handleClose}
      >
        <div
          className={`${isFullScreen
            ? 'w-full h-full max-w-none rounded-none shadow-none flex flex-col items-center justify-center p-4 bg-white animate-slide-up'
            : 'bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full relative transform transition-all duration-300 scale-100'
            }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button (X) */}
          <button
            onClick={handleClose}
            className={`absolute right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100 ${isFullScreen ? 'top-24' : 'top-4'
              }`}
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className={isFullScreen ? "w-full max-w-md flex flex-col items-center" : "w-full"}>
            {/* Icon */}
            {type === 'confirmation' ? (
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-blue-100">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            ) : type === 'error' ? (
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-red-100">
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            ) : type === 'verification_required' ? (
              <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-yellow-100">
                <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            ) : (
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-green-100">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}

            {/* Title & Message */}
            <h2
              id="modal-title"
              className="text-3xl font-bold text-gray-900 text-center mb-2"
            >
              {title}
            </h2>
            <p
              className="text-lg text-gray-600 text-center mb-8 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: message }}
            />

            {/* Metadata Section: Payment Success */}
            {type === 'payment_success' && (
              <div className="bg-gray-50 rounded-2xl p-5 space-y-3 mb-8 border border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm font-medium">Amount Paid</span>
                  <span className="text-gray-900 font-bold">₹{metadata?.amount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm font-medium">Plan</span>
                  <span className="text-gray-900 font-semibold">{metadata?.planName}</span>
                </div>
                {metadata?.validUntil && (
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <span className="text-gray-500 text-sm font-medium">Valid Until</span>
                    <span className="text-gray-700 text-sm">{metadata.validUntil}</span>
                  </div>
                )}
              </div>
            )}

            {/* Metadata Section: Application Submitted */}
            {type === 'application_submitted' && (
              <div className={`${isFullScreen ? 'mb-10 text-center' : 'bg-gray-50 rounded-2xl p-5 mb-8 border border-gray-100 text-center'}`}>
                <div className="flex flex-col items-center">
                  <span className={`${isFullScreen ? 'text-4xl font-bold text-gray-900 mb-3' : 'text-gray-900 font-bold text-lg'}`}>
                    {metadata?.jobTitle}
                  </span>
                  {metadata?.companyName && (
                    <span className={`${isFullScreen ? 'text-2xl text-gray-500' : 'text-gray-500 font-medium'}`}>
                      {metadata.companyName}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {type === 'confirmation' ? (
              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="flex-1 bg-gray-100 text-gray-700 rounded-xl py-3.5 font-semibold text-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (onConfirm) onConfirm();
                    // Removed hide() to allow smooth transition to success state
                  }}
                  className="flex-1 bg-gray-900 text-white rounded-xl py-3.5 font-semibold text-lg hover:bg-gray-800 transition-colors"
                >
                  Confirm
                </button>
              </div>
            ) : type === 'verification_required' ? (
              <div className="flex flex-col gap-3 w-full">
                <button
                  onClick={() => {
                    if (onConfirm) onConfirm();
                  }}
                  className="w-full bg-yellow-500 text-white rounded-xl py-3.5 font-semibold text-lg hover:bg-yellow-600 transition-colors shadow-sm"
                >
                  Resend Verification Email
                </button>
                <button
                  onClick={handleClose}
                  className="w-full bg-gray-100 text-gray-700 rounded-xl py-3.5 font-semibold text-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <button
                onClick={handleClose}
                className="w-full bg-gray-900 text-white rounded-xl py-3.5 font-semibold text-lg hover:bg-gray-800 transition-colors focus:outline-none focus:ring-4 focus:ring-gray-200"
              >
                Continue
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}