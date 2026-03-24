'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Loader2, Sparkles } from 'lucide-react';

const PUBLIC_PATHS = ['/login', '/portal'];

const requireAuth = process.env.NEXT_PUBLIC_REQUIRE_AUTH === 'true';

export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Auth is not required - skip guard
  if (!requireAuth) {
    return <>{children}</>;
  }

  // Check if current path is public
  const isPublicPath = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  if (isPublicPath) {
    return <>{children}</>;
  }

  // Still loading auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a2744] flex flex-col items-center justify-center">
        <div className="w-14 h-14 rounded-xl bg-[#ea580c] flex items-center justify-center mb-4">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <Loader2 className="w-6 h-6 text-white/60 animate-spin mt-4" />
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!user) {
    if (typeof window !== 'undefined') {
      router.replace('/login');
    }
    return (
      <div className="min-h-screen bg-[#1a2744] flex flex-col items-center justify-center">
        <div className="w-14 h-14 rounded-xl bg-[#ea580c] flex items-center justify-center mb-4">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <Loader2 className="w-6 h-6 text-white/60 animate-spin mt-4" />
      </div>
    );
  }

  return <>{children}</>;
};
