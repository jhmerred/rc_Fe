export enum GroupMemberRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER'
}

export interface User {
  id: number;
  name: string;
  email: string;
  created_at?: string;
  updated_at?: string;
}

export interface GroupMember {
  id: number;
  user_id: number;
  group_id: number;
  role: GroupMemberRole;
  user?: User;
  created_at?: string;
  updated_at?: string;
}

export interface Group {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  created_by_id: number;
  created_by?: User;
  members?: GroupMember[];
  member_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateGroupRequest {
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface UpdateGroupRequest {
  name?: string;
  description?: string;
  is_active?: boolean;
}

export interface AddGroupMemberRequest {
  user_id: number;
  role: GroupMemberRole;
}

export interface UpdateGroupMemberRequest {
  role: GroupMemberRole;
}

export interface GroupListResponse {
  groups: Group[];
  total: number;
  skip: number;
  limit: number;
}

export interface GroupFilters {
  page?: number;
  limit?: number;
  search?: string;
  is_active?: boolean;
}