'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({ user: null, isLoading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const isAuthPage = pathname.startsWith('/auth');
    const isLandingPage = pathname === '/';

    // If user is not logged in, and not on a public page, redirect to sign-in
    if (!user && !isAuthPage && !isLandingPage) {
      router.push('/auth/sign-in');
    }
    
    // If user is logged in and on an auth page, redirect to dashboard
    if (user && isAuthPage) {
      router.push('/dashboard');
    }
  }, [user, isLoading, pathname, router]);

  // While loading, or if access is not yet determined, show a loader
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isAuthPage = pathname.startsWith('/auth');
  const isLandingPage = pathname === '/';

  // Allow access to public pages for everyone, and auth pages for unauthenticated users
  if (isLandingPage || isAuthPage) {
    return <AuthContext.Provider value={{ user, isLoading }}>{children}</AuthContext.Provider>;
  }

  // If user is authenticated, allow access to the app
  if (user) {
    return <AuthContext.Provider value={{ user, isLoading }}>{children}</AuthContext.Provider>;
  }
  
  // In other cases (like redirecting), return null to avoid rendering children prematurely
  return null;
}

export const useAuth = () => useContext(AuthContext);
