import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { groupApi } from './api';
import { 
  CreateGroupRequest, 
  UpdateGroupRequest, 
  GroupFilters,
  AddGroupMemberRequest,
  UpdateGroupMemberRequest 
} from './types';

const GROUP_QUERY_KEYS = {
  all: ['groups'] as const,
  lists: () => [...GROUP_QUERY_KEYS.all, 'list'] as const,
  list: (filters?: GroupFilters) => [...GROUP_QUERY_KEYS.lists(), filters] as const,
  details: () => [...GROUP_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...GROUP_QUERY_KEYS.details(), id] as const,
  members: (groupId: string) => [...GROUP_QUERY_KEYS.detail(groupId), 'members'] as const,
};

// Group queries
export const useGroups = (filters?: GroupFilters) => {
  return useQuery({
    queryKey: GROUP_QUERY_KEYS.list(filters),
    queryFn: () => groupApi.getGroups(filters),
  });
};

export const useGroup = (id: string) => {
  return useQuery({
    queryKey: GROUP_QUERY_KEYS.detail(id),
    queryFn: () => groupApi.getGroupById(id),
    enabled: !!id,
  });
};

export const useGroupMembers = (groupId: string) => {
  return useQuery({
    queryKey: GROUP_QUERY_KEYS.members(groupId),
    queryFn: () => groupApi.getGroupMembers(groupId),
    enabled: !!groupId,
  });
};

// Group mutations
export const useCreateGroup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateGroupRequest) => groupApi.createGroup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GROUP_QUERY_KEYS.lists() });
    },
  });
};

export const useUpdateGroup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGroupRequest }) => 
      groupApi.updateGroup(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: GROUP_QUERY_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: GROUP_QUERY_KEYS.lists() });
    },
  });
};

export const useDeleteGroup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => groupApi.deleteGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GROUP_QUERY_KEYS.lists() });
    },
  });
};

// Member mutations
export const useAddGroupMember = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ groupId, data }: { groupId: string; data: AddGroupMemberRequest }) => 
      groupApi.addGroupMember(groupId, data),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: GROUP_QUERY_KEYS.members(groupId) });
      queryClient.invalidateQueries({ queryKey: GROUP_QUERY_KEYS.detail(groupId) });
    },
  });
};

export const useUpdateGroupMember = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ groupId, memberId, data }: { 
      groupId: string; 
      memberId: string; 
      data: UpdateGroupMemberRequest 
    }) => groupApi.updateGroupMember(groupId, memberId, data),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: GROUP_QUERY_KEYS.members(groupId) });
    },
  });
};

export const useRemoveGroupMember = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ groupId, memberId }: { groupId: string; memberId: string }) => 
      groupApi.removeGroupMember(groupId, memberId),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: GROUP_QUERY_KEYS.members(groupId) });
      queryClient.invalidateQueries({ queryKey: GROUP_QUERY_KEYS.detail(groupId) });
    },
  });
};