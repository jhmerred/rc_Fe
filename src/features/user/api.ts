import { createAPIRequest } from '@/shared/lib/request';
import { 
  User, 
  CreateHRRequest, 
  CreateEndUserRequest, 
  UpdateUserRequest, 
  UsersResponse, 
  UserFilterParams 
} from './types';

const USER_ENDPOINTS = {
  ME: '/users/me',
  USERS: '/users',
  USER_BY_ID: (id: string) => `/users/${id}`,
  CREATE_HR: '/users/hr',
  CREATE_ENDUSER: '/users/enduser',
  ACTIVATE_USER: (id: string) => `/users/${id}/activate`,
  DEACTIVATE_USER: (id: string) => `/users/${id}/deactivate`,
} as const;

export const userApi = {
  getMe: (): Promise<User> => 
    createAPIRequest.get(USER_ENDPOINTS.ME),

  getUsers: (params?: UserFilterParams): Promise<UsersResponse> => 
    createAPIRequest.get(USER_ENDPOINTS.USERS, { params }),

  getUserById: (id: string): Promise<User> => 
    createAPIRequest.get(USER_ENDPOINTS.USER_BY_ID(id)),

  createHR: (data: CreateHRRequest): Promise<User> => 
    createAPIRequest.post(USER_ENDPOINTS.CREATE_HR, data),

  createEndUser: (data: CreateEndUserRequest): Promise<User> => 
    createAPIRequest.post(USER_ENDPOINTS.CREATE_ENDUSER, data),

  updateUser: (id: string, data: UpdateUserRequest): Promise<User> => 
    createAPIRequest.put(USER_ENDPOINTS.USER_BY_ID(id), data),

  deleteUser: (id: string): Promise<void> => 
    createAPIRequest.delete(USER_ENDPOINTS.USER_BY_ID(id)),

  activateUser: (id: string): Promise<User> =>
    createAPIRequest.post(USER_ENDPOINTS.ACTIVATE_USER(id)),

  deactivateUser: (id: string): Promise<User> =>
    createAPIRequest.post(USER_ENDPOINTS.DEACTIVATE_USER(id)),
};