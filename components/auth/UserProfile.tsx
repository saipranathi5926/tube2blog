'use client';

import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';

export default function UserProfile() {
  const { data: session } = useSession();

  if (!session?.user) return null;

  return (
    <div className="flex items-center space-x-4">
      {session.user.image && (
        <div className="relative h-10 w-10 rounded-full overflow-hidden">
          <Image
            src={session.user.image}
            alt={session.user.name || 'User avatar'}
            fill
            className="object-cover"
          />
        </div>
      )}
      <div className="text-sm">
        <p className="font-medium text-gray-900">{session.user.name}</p>
        <p className="text-gray-500">{session.user.email}</p>
      </div>
      <button
        onClick={() => signOut({ callbackUrl: '/auth/signin' })}
        className="ml-4 text-sm font-medium text-indigo-600 hover:text-indigo-500"
      >
        Sign out
      </button>
    </div>
  );
}
