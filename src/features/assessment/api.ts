import { createAPIRequest } from '@/shared/lib/request';
import { 
  Assessment,
  AssessmentSession,
  AssessmentResult,
  AssessmentChat,
  CreateAssessmentRequest,
  UpdateAssessmentRequest,
  AssessmentsListResponse,
  AssessmentFilters,
  SessionsListResponse,
  SessionFilters
} from './types';

const ASSESSMENT_ENDPOINTS = {
  ASSESSMENTS: '/assessments',
  ASSESSMENT_BY_ID: (id: string) => `/assessments/${id}`,
  ASSESSMENT_SESSIONS: (assessmentId: string) => `/assessments/${assessmentId}/sessions`,
  SESSION_BY_ID: (sessionId: string) => `/sessions/${sessionId}`,
  SESSION_CHATS: (sessionId: string) => `/sessions/${sessionId}/chats`,
  SESSION_RESULT: (sessionId: string) => `/sessions/${sessionId}/result`,
} as const;

export const assessmentApi = {
  // Assessment CRUD
  getAssessments: (filters?: AssessmentFilters): Promise<AssessmentsListResponse> => 
    createAPIRequest.get(ASSESSMENT_ENDPOINTS.ASSESSMENTS, { params: filters }),

  getAssessmentById: (id: string): Promise<Assessment> => 
    createAPIRequest.get(ASSESSMENT_ENDPOINTS.ASSESSMENT_BY_ID(id)),

  createAssessment: (data: CreateAssessmentRequest): Promise<Assessment> => 
    createAPIRequest.post(ASSESSMENT_ENDPOINTS.ASSESSMENTS, data),

  updateAssessment: (id: string, data: UpdateAssessmentRequest): Promise<Assessment> => 
    createAPIRequest.patch(ASSESSMENT_ENDPOINTS.ASSESSMENT_BY_ID(id), data),

  deleteAssessment: (id: string): Promise<void> => 
    createAPIRequest.delete(ASSESSMENT_ENDPOINTS.ASSESSMENT_BY_ID(id)),

  // Session Management
  getAssessmentSessions: (assessmentId: string, filters?: SessionFilters): Promise<SessionsListResponse> => 
    createAPIRequest.get(ASSESSMENT_ENDPOINTS.ASSESSMENT_SESSIONS(assessmentId), { params: filters }),

  getSessionById: (sessionId: string): Promise<AssessmentSession> => 
    createAPIRequest.get(ASSESSMENT_ENDPOINTS.SESSION_BY_ID(sessionId)),

  startSession: (assessmentId: string, userId: number): Promise<AssessmentSession> => 
    createAPIRequest.post(ASSESSMENT_ENDPOINTS.ASSESSMENT_SESSIONS(assessmentId), { user_id: userId }),

  updateSessionStatus: (sessionId: string, status: string): Promise<AssessmentSession> => 
    createAPIRequest.patch(ASSESSMENT_ENDPOINTS.SESSION_BY_ID(sessionId), { status }),

  // Chat Management
  getSessionChats: (sessionId: string): Promise<AssessmentChat[]> => 
    createAPIRequest.get(ASSESSMENT_ENDPOINTS.SESSION_CHATS(sessionId)),

  addChat: (sessionId: string, chat: { role: string; content: string }): Promise<AssessmentChat> => 
    createAPIRequest.post(ASSESSMENT_ENDPOINTS.SESSION_CHATS(sessionId), chat),

  // Result Management
  getSessionResult: (sessionId: string): Promise<AssessmentResult> => 
    createAPIRequest.get(ASSESSMENT_ENDPOINTS.SESSION_RESULT(sessionId)),

  generateReport: (sessionId: string): Promise<AssessmentResult> => 
    createAPIRequest.post(ASSESSMENT_ENDPOINTS.SESSION_RESULT(sessionId), { generate_report: true }),
};