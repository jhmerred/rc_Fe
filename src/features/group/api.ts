import { createAPIRequest } from '@/shared/lib/request';
import { 
  Group, 
  GroupMember,
  CreateGroupRequest, 
  UpdateGroupRequest, 
  GroupListResponse, 
  GroupFilters,
  AddGroupMemberRequest,
  UpdateGroupMemberRequest 
} from './types';

const GROUP_ENDPOINTS = {
  GROUPS: '/groups',
  GROUP_BY_ID: (id: string) => `/groups/${id}`,
  GROUP_MEMBERS: (groupId: string) => `/groups/${groupId}/members`,
  GROUP_MEMBER_BY_USER_ID: (groupId: string, userId: string) => `/groups/${groupId}/members/${userId}`,
} as const;

export const groupApi = {
  // Group CRUD
  getGroups: (filters?: GroupFilters): Promise<GroupListResponse> => 
    createAPIRequest.get(GROUP_ENDPOINTS.GROUPS, { params: filters }),

  getGroupById: (id: string): Promise<Group> => 
    createAPIRequest.get(GROUP_ENDPOINTS.GROUP_BY_ID(id)),

  createGroup: (data: CreateGroupRequest): Promise<Group> => 
    createAPIRequest.post(GROUP_ENDPOINTS.GROUPS, data),

  updateGroup: (id: string, data: UpdateGroupRequest): Promise<Group> => 
    createAPIRequest.put(GROUP_ENDPOINTS.GROUP_BY_ID(id), data),

  deleteGroup: (id: string): Promise<void> => 
    createAPIRequest.delete(GROUP_ENDPOINTS.GROUP_BY_ID(id)),

  // Group Member Management
  getGroupMembers: (groupId: string): Promise<GroupMember[]> => 
    createAPIRequest.get(GROUP_ENDPOINTS.GROUP_MEMBERS(groupId)),

  addGroupMember: (groupId: string, data: AddGroupMemberRequest): Promise<GroupMember> => 
    createAPIRequest.post(GROUP_ENDPOINTS.GROUP_MEMBERS(groupId), data),

  updateGroupMember: (groupId: string, userId: string, data: UpdateGroupMemberRequest): Promise<GroupMember> => 
    createAPIRequest.put(GROUP_ENDPOINTS.GROUP_MEMBER_BY_USER_ID(groupId, userId), data),

  removeGroupMember: (groupId: string, userId: string): Promise<void> => 
    createAPIRequest.delete(GROUP_ENDPOINTS.GROUP_MEMBER_BY_USER_ID(groupId, userId)),
};