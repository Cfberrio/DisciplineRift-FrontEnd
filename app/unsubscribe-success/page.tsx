'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

/**
 * Internal component that reads query params via useSearchParams
 */
function UnsubscribeSuccessContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || 'your email';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* Success icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-center mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Successfully Unsubscribed
          </h1>

          {/* Message */}
          <div className="text-center mb-6">
            <p className="text-gray-600 mb-2">
              You have successfully unsubscribed from our newsletter.
            </p>
            <div className="bg-gray-50 rounded-lg p-3 mt-4">
              <p className="text-sm text-gray-500 mb-1">Removed email:</p>
              <p className="text-gray-900 font-medium break-all">{email}</p>
            </div>
          </div>

          {/* Additional info */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              You will no longer receive newsletter emails from us. If you change your mind,
              you can always subscribe again from our homepage.
            </p>
          </div>

          {/* Back button */}
          <Link
            href="/"
            className="block w-full text-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Back to Home
          </Link>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Need help? Contact us at{' '}
          <a
            href="mailto:info@disciplinerift.com"
            className="text-blue-600 hover:text-blue-700 underline"
          >
            info@disciplinerift.com
          </a>
        </p>
      </div>
    </div>
  );
}

/**
 * Unsubscribe confirmation page
 */
export default function UnsubscribeSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <UnsubscribeSuccessContent />
    </Suspense>
  );
}

