import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userApi } from "./api";
import {
  CreateEndUserRequest,
  CreateHRRequest,
  UpdateUserRequest,
  UserFilterParams,
} from "./types";
import { queryKeys } from "@/shared/query/keys";

export const useCurrentUser = () => {
  return useQuery({
    queryKey: queryKeys.user.profile("me"),
    queryFn: () => userApi.getMe(),
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
};

export const useUsers = (filters?: UserFilterParams) => {
  return useQuery({
    queryKey: queryKeys.user.list(filters),
    queryFn: () => userApi.getUsers(filters),
    staleTime: 1000 * 60 * 2,
  });
};

export const useUser = (id: string, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.user.detail(id),
    queryFn: () => userApi.getUserById(id),
    enabled: !!id && enabled,
  });
};

// TODO 에러 핸들링 사용자 친화적으로 수정 필
export const useCreateHR = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateHRRequest) => userApi.createHR(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.lists() });
    },
    onError: (error: any) => {
      console.error("HR 생성 실패:", error.response?.data?.detail || error);
    },
  });
};

export const useCreateEndUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEndUserRequest) => userApi.createEndUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.lists() });
    },
    onError: (error: any) => {
      console.error(
        "End User 생성 실패:",
        error.response?.data?.detail || error,
      );
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) =>
      userApi.updateUser(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.lists() });
    },
    onError: (error: any) => {
      console.error("사용자 수정 실패:", error.response?.data?.detail || error);
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.lists() });
    },
    onError: (error: any) => {
      console.error("사용자 삭제 실패:", error.response?.data?.detail || error);
    },
  });
};

export const useActivateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userApi.activateUser(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.lists() });
    },
    onError: (error: any) => {
      console.error(
        "사용자 활성화 실패:",
        error.response?.data?.detail || error,
      );
    },
  });
};

export const useDeactivateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userApi.deactivateUser(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.lists() });
    },
    onError: (error: any) => {
      console.error(
        "사용자 비활성화 실패:",
        error.response?.data?.detail || error,
      );
    },
  });
};
