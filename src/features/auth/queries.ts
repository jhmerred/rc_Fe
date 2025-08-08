import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authApi } from './api';
import { LoginRequest } from './types';
import { queryKeys } from '@/shared/query/keys';
import { setAccessToken, clearAccessToken } from '@/shared/lib/token';
import { useCurrentUser } from '@/features/user/queries';

export const useGoogleLogin = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.googleLogin(data),
    onSuccess: (data) => {
      setAccessToken(data.accessToken);
      queryClient.setQueryData(queryKeys.user.profile('me'), data.user);
      queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
      router.push('/');
    },
    onError: (error) => {
      console.error('Login failed:', error);
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      clearAccessToken();
      queryClient.clear();
      router.push('/login');
    },
    onError: (error) => {
      console.error('Logout failed:', error);
      clearAccessToken();
      queryClient.clear();
      router.push('/login');
    },
  });
};

export const useAuth = () => {
  const { data: user, isLoading } = useCurrentUser();
  
  return {
    user: user ?? null,
    isAuthenticated: !!user,
    isLoading,
  };
};