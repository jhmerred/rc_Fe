import { createAPIRequest } from '@/shared/lib/request';
import { LoginRequest, LoginResponse, RefreshResponse, EndUserLoginRequest } from './types';

const AUTH_ENDPOINTS = {
  LOGIN: '/auth/google',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
  ENDUSER_LOGIN: '/auth/enduser/login',
} as const;

export const authApi = {
  googleLogin: (data: LoginRequest): Promise<LoginResponse> => 
    createAPIRequest.post(AUTH_ENDPOINTS.LOGIN, data),

  logout: (): Promise<void> => 
    createAPIRequest.post(AUTH_ENDPOINTS.LOGOUT),

  refreshToken: (): Promise<RefreshResponse> => 
    createAPIRequest.post(AUTH_ENDPOINTS.REFRESH),
  
  endUserLogin: (data: EndUserLoginRequest): Promise<LoginResponse> =>
    createAPIRequest.post(AUTH_ENDPOINTS.ENDUSER_LOGIN, data),
};