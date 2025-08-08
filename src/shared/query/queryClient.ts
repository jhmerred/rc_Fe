import { QueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error instanceof AxiosError) {
          if (error.response?.status === 401) {
            return false;
          }
          if (error.response?.status && error.response.status >= 400 && error.response.status < 500) {
            return false;
          }
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
    },
    mutations: {
      retry: false,
      onError: (error) => {
        if (error instanceof AxiosError) {
          const message = error.response?.data?.message || '요청 처리 중 오류가 발생했습니다.';
          console.error('Mutation error:', message);
        }
      },
    },
  },
});

export default queryClient;


// ✅ 2. refetchOnMount: true → 경우에 따라 false도 고려
// UX가 중요한 페이지에서는 사용자 관점에서 "불필요한 리패치"를 막기 위해 false로 설정하는 경우도 많습니다.

// 캐싱이 중요한 페이지(예: /dashboard)는 refetchOnMount: false + refetchOnReconnect: false 설정도 고려해보세요.