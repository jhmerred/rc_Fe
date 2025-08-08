export enum AssessmentStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED'
}

export enum AssessmentSessionStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  EXPIRED = 'EXPIRED'
}

export enum ChatRole {
  USER = 'USER',
  ASSISTANT = 'ASSISTANT',
  SYSTEM = 'SYSTEM'
}

export interface User {
  id: number;
  name: string;
  email: string;
  created_at?: string;
  updated_at?: string;
}

export interface Group {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  created_by_id: number;
  created_at?: string;
  updated_at?: string;
}

export interface Assessment {
  id: number;
  title: string;
  description?: string;
  group_id: number;
  created_by_id: number;
  status: AssessmentStatus;
  start_date?: string;
  end_date?: string;
  content?: any;
  settings?: any;
  group?: Group;
  created_by?: User;
  sessions?: AssessmentSession[];
  created_at?: string;
  updated_at?: string;
}

export interface AssessmentSession {
  id: number;
  assessment_id: number;
  user_id: number;
  status: AssessmentSessionStatus;
  started_at?: string;
  completed_at?: string;
  session_metadata?: any;
  assessment?: Assessment;
  user?: User;
  chats?: AssessmentChat[];
  result?: AssessmentResult;
  created_at?: string;
  updated_at?: string;
}

export interface AssessmentResult {
  id: number;
  session_id: number;
  final_score?: number;
  category_scores?: any;
  analysis?: any;
  recommendations?: any;
  report_generated: boolean;
  report_url?: string;
  session?: AssessmentSession;
  created_at?: string;
  updated_at?: string;
}

export interface AssessmentChat {
  id: number;
  session_id: number;
  role: ChatRole;
  content: string;
  sequence_number: number;
  chat_metadata?: any;
  session?: AssessmentSession;
  created_at?: string;
  updated_at?: string;
}

export interface CreateAssessmentRequest {
  title: string;
  description?: string;
  group_id: number;
  status?: AssessmentStatus;
  start_date?: string;
  end_date?: string;
  content?: any;
  settings?: any;
}

export interface UpdateAssessmentRequest {
  title?: string;
  description?: string;
  status?: AssessmentStatus;
  start_date?: string;
  end_date?: string;
  content?: any;
  settings?: any;
}

export interface AssessmentsListResponse {
  items: Assessment[];
  total: number;
  page: number;
  limit: number;
}

export interface AssessmentFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: AssessmentStatus;
  group_id?: number;
}

export interface SessionsListResponse {
  items: AssessmentSession[];
  total: number;
  page: number;
  limit: number;
}

export interface SessionFilters {
  page?: number;
  limit?: number;
  assessment_id?: number;
  user_id?: number;
  status?: AssessmentSessionStatus;
}