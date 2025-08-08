import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from './api';
import { 
  User, 
  CreateHRRequest, 
  CreateEndUserRequest, 
  UpdateUserRequest, 
  UserFilterParams 
} from './types';

const USER_QUERY_KEYS = {
  all: ['users'] as const,
  lists: () => [...USER_QUERY_KEYS.all, 'list'] as const,
  list: (params: UserFilterParams) => [...USER_QUERY_KEYS.lists(), params] as const,
  details: () => [...USER_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...USER_QUERY_KEYS.details(), id] as const,
  me: () => [...USER_QUERY_KEYS.all, 'me'] as const,
} as const;

export const useMe = () => {
  return useQuery({
    queryKey: USER_QUERY_KEYS.me(),
    queryFn: userApi.getMe,
  });
};

export const useUsers = (params?: UserFilterParams) => {
  return useQuery({
    queryKey: USER_QUERY_KEYS.list(params || {}),
    queryFn: () => userApi.getUsers(params),
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: USER_QUERY_KEYS.detail(id),
    queryFn: () => userApi.getUserById(id),
    enabled: !!id,
  });
};

export const useCreateHR = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateHRRequest) => userApi.createHR(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.lists() });
    },
  });
};

export const useCreateEndUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEndUserRequest) => userApi.createEndUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.lists() });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) =>
      userApi.updateUser(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.detail(id) });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.lists() });
    },
  });
};

export const useActivateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userApi.activateUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.lists() });
    },
  });
};

export const useDeactivateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userApi.deactivateUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.lists() });
    },
  });
};