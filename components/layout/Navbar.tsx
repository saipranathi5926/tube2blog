'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import UserProfile from '../auth/UserProfile';

export default function Navbar() {
  const { status } = useSession();

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900">
              Your App Name
            </Link>
          </div>
          
          <div className="flex items-center">
            {status === 'authenticated' ? (
              <UserProfile />
            ) : (
              <Link
                href="/auth/signin"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
