'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/features/auth/queries';
import { UserRole } from '@/types/user';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  allowedRoles?: UserRole[];
  loadingComponent?: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function AuthGuard({ 
  children, 
  requireAuth = true,
  redirectTo,
  allowedRoles,
  loadingComponent,
  fallback
}: AuthGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const defaultRedirect = requireAuth ? '/login' : '/';
  const finalRedirectTo = redirectTo || defaultRedirect;

  useEffect(() => {
    if (!isLoading) {
      // requireAuth가 true인데 로그인 안 됨 -> 로그인 페이지로
      if (requireAuth && !isAuthenticated) {
        const returnUrl = encodeURIComponent(pathname);
        router.push(`${finalRedirectTo}?returnUrl=${returnUrl}`);
      }
      // requireAuth가 false인데 로그인 됨 -> 홈으로
      else if (!requireAuth && isAuthenticated) {
        router.push(finalRedirectTo);
      }
      // 역할 체크
      else if (requireAuth && isAuthenticated && allowedRoles && user) {
        if (!allowedRoles.includes(user.role)) {
          router.push('/unauthorized');
        }
      }
    }
  }, [isAuthenticated, isLoading, requireAuth, user, allowedRoles, router, finalRedirectTo, pathname]);

  if (isLoading) {
    return (
      <>
        {loadingComponent || (
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        )}
      </>
    );
  }

  // requireAuth가 true인데 로그인 안 됨
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // requireAuth가 false인데 로그인 됨
  if (!requireAuth && isAuthenticated) {
    return null;
  }

  // 역할 체크 실패
  if (requireAuth && isAuthenticated && allowedRoles && user) {
    if (!allowedRoles.includes(user.role)) {
      return (
        <>
          {fallback || (
            <div className="flex flex-col items-center justify-center min-h-screen">
              <h1 className="text-2xl font-bold mb-4">접근 권한이 없습니다</h1>
              <p className="text-gray-600">이 페이지에 접근할 권한이 없습니다.</p>
            </div>
          )}
        </>
      );
    }
  }

  return <>{children}</>;
}