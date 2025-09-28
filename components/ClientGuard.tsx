'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Account } from '@/lib/types';
import NavBar from '@/components/NavBar';

interface ClientGuardProps {
  children: React.ReactNode;
}

export default function ClientGuard({ children }: ClientGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const accountData = sessionStorage.getItem('finmate_account');
        
        if (!accountData && pathname !== '/welcome') {
          // No account found and not on welcome page - redirect to welcome
          router.replace('/welcome');
          return;
        }

        if (accountData) {
          // Account exists - parse and validate
          const account: Account = JSON.parse(accountData);
          if (account.id && account.name && account.email && account.createdAt) {
            setIsAuthenticated(true);
          } else {
            // Invalid account data - clear and redirect
            sessionStorage.removeItem('finmate_account');
            sessionStorage.removeItem('finmate_budget_store');
            router.replace('/welcome');
            return;
          }
        }

        // If we're on welcome page and have valid account, redirect to dashboard
        if (pathname === '/welcome' && accountData) {
          const account: Account = JSON.parse(accountData);
          if (account.id && account.name && account.email && account.createdAt) {
            router.replace('/');
            return;
          }
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        // Clear potentially corrupted data
        sessionStorage.removeItem('finmate_account');
        sessionStorage.removeItem('finmate_budget_store');
        router.replace('/welcome');
        return;
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [router, pathname]);

  // Show loading state while checking authentication
  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing...</p>
        </div>
      </div>
    );
  }

  // Don't render protected content if not authenticated and not on welcome page
  if (!isAuthenticated && pathname !== '/welcome') {
    return null;
  }

  // Show welcome page without navbar and mobile wrapper
  if (pathname === '/welcome') {
    return <>{children}</>;
  }

  // Show authenticated content with navbar and mobile wrapper
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-sm bg-white min-h-screen shadow-lg relative">
        {children}
        <NavBar />
      </div>
    </div>
  );
}
