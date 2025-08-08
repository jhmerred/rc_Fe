export enum UserRole {
  ADMIN = "ADMIN",
  HR = "HR",
  ENDUSER = "ENDUSER",
}

export interface User {
  id: number;
  email?: string;
  google_id?: string;
  picture?: string;
  name?: string;
  is_active: boolean;
  role: UserRole;
  enduser_token?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateHRRequest {
  email: string;
  group_id: number;
}

export interface CreateEndUserRequest {
  name: string;
  group_id: number;
}

export interface UpdateUserRequest {
  email?: string;
  name?: string;
  picture?: string;
  is_active?: boolean;
  role?: UserRole;
}

export interface UserFilterParams {
  role?: UserRole;
  is_active?: boolean;
  skip?: number;
  limit?: number;
}

export interface UsersResponse {
  users: User[];
  total: number;
  skip: number;
  limit: number;
}