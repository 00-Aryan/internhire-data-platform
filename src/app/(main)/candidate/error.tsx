'use client'

"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-red-50 border border-red-200 rounded-xl p-8 text-center">
        <h2 className="text-2xl font-bold text-red-900 mb-4">
          Something went wrong!
        </h2>
        <p className="text-red-700 mb-6">
          An error occurred while loading this page.
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
