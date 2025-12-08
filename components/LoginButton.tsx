'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { Button } from './ui/button';
import { Loader2, LogIn, LogOut } from 'lucide-react';
import { Session } from 'next-auth';

interface UserSession extends Session {
  user?: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export default function LoginButton() {
  const { data: session, status } = useSession() as { data: UserSession | null, status: string };

  if (status === 'loading') {
    return (
      <Button disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading...
      </Button>
    );
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-slate-300">
          {session.user?.name || session.user?.email}
        </span>
        <Button variant="outline" onClick={() => signOut()}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={() => signIn('google')}>
      <LogIn className="mr-2 h-4 w-4" />
      Sign in with Google
    </Button>
  );
}
