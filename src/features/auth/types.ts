import { UserRole } from '@/types/user';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  profileImage?: string;
  role: UserRole;
}

export interface LoginRequest {
  googleToken: string;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export interface RefreshResponse {
  accessToken: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface EndUserLoginRequest {
  token: string;
  name: string;
}