import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { groupApi } from './api';
import { CreateGroupRequest, UpdateGroupRequest, GroupFilters, AddGroupMemberRequest, UpdateGroupMemberRequest } from './types';
import { queryKeys } from '@/shared/query/keys';

export const useGroups = (filters?: GroupFilters) => {
  return useQuery({
    queryKey: queryKeys.group.list(filters),
    queryFn: () => groupApi.getGroups(filters),
    staleTime: 1000 * 60 * 2,
  });
};

export const useGroup = (id: string) => {
  return useQuery({
    queryKey: queryKeys.group.detail(id),
    queryFn: () => groupApi.getGroupById(id),
    enabled: !!id,
  });
};

export const useCreateGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateGroupRequest) => groupApi.createGroup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.group.lists() });
    },
  });
};

export const useUpdateGroup = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateGroupRequest) => groupApi.updateGroup(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.group.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.group.lists() });
    },
  });
};

export const useDeleteGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => groupApi.deleteGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.group.lists() });
    },
  });
};

// Group Member Hooks
export const useGroupMembers = (groupId: string) => {
  return useQuery({
    queryKey: queryKeys.group.members(groupId),
    queryFn: () => groupApi.getGroupMembers(groupId),
    enabled: !!groupId,
  });
};

export const useAddGroupMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, data }: { groupId: string; data: AddGroupMemberRequest }) => 
      groupApi.addGroupMember(groupId, data),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.group.members(groupId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.group.detail(groupId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.group.lists() });
    },
  });
};

export const useUpdateGroupMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, userId, data }: { groupId: string; userId: string; data: UpdateGroupMemberRequest }) => 
      groupApi.updateGroupMember(groupId, userId, data),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.group.members(groupId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.group.detail(groupId) });
    },
  });
};

export const useRemoveGroupMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, userId }: { groupId: string; userId: string }) => 
      groupApi.removeGroupMember(groupId, userId),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.group.members(groupId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.group.detail(groupId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.group.lists() });
    },
  });
};