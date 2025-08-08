'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { setAccessToken } from '@/shared/lib/token';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/query/keys';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const accessToken = searchParams.get('token');
      const errorParam = searchParams.get('error');
      const returnUrl = searchParams.get('returnUrl') || '/';

      if (errorParam) {
        setError('로그인이 취소되었거나 실패했습니다.');
        setTimeout(() => router.push('/login'), 3000);
        return;
      }

      if (!accessToken) {
        setError('액세스 토큰이 없습니다.');
        setTimeout(() => router.push('/login'), 3000);
        return;
      }

      try {
        // 액세스 토큰 저장
        setAccessToken(accessToken);
        
        // 사용자 정보 쿼리 무효화 (새로 가져오도록)
        await queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
        
        // 리다이렉트
        router.push(decodeURIComponent(returnUrl));
      } catch (error) {
        console.error('Callback error:', error);
        setError('로그인 처리 중 오류가 발생했습니다.');
        setTimeout(() => router.push('/login'), 3000);
      }
    };

    handleCallback();
  }, [searchParams, router, queryClient]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-red-500">
              <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="mt-6 text-2xl font-bold text-gray-900">로그인 실패</h2>
            <p className="mt-2 text-sm text-gray-600">{error}</p>
            <p className="mt-4 text-xs text-gray-500">잠시 후 로그인 페이지로 이동합니다...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <h2 className="mt-6 text-2xl font-bold text-gray-900">로그인 처리 중</h2>
          <p className="mt-2 text-sm text-gray-600">
            인증 정보를 확인하는 중입니다...
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <h2 className="mt-6 text-2xl font-bold text-gray-900">로딩 중...</h2>
          </div>
        </div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}