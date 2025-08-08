import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { assessmentApi } from './api';
import { 
  CreateAssessmentRequest,
  UpdateAssessmentRequest,
  AssessmentFilters,
  SessionFilters,
  AssessmentSessionStatus
} from './types';

const ASSESSMENT_QUERY_KEYS = {
  all: ['assessments'] as const,
  lists: () => [...ASSESSMENT_QUERY_KEYS.all, 'list'] as const,
  list: (filters?: AssessmentFilters) => [...ASSESSMENT_QUERY_KEYS.lists(), filters] as const,
  details: () => [...ASSESSMENT_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...ASSESSMENT_QUERY_KEYS.details(), id] as const,
  sessions: (assessmentId: string) => [...ASSESSMENT_QUERY_KEYS.detail(assessmentId), 'sessions'] as const,
  session: (sessionId: string) => ['session', sessionId] as const,
  chats: (sessionId: string) => [...ASSESSMENT_QUERY_KEYS.session(sessionId), 'chats'] as const,
  result: (sessionId: string) => [...ASSESSMENT_QUERY_KEYS.session(sessionId), 'result'] as const,
};

// Assessment queries
export const useAssessments = (filters?: AssessmentFilters) => {
  return useQuery({
    queryKey: ASSESSMENT_QUERY_KEYS.list(filters),
    queryFn: () => assessmentApi.getAssessments(filters),
  });
};

export const useAssessment = (id: string) => {
  return useQuery({
    queryKey: ASSESSMENT_QUERY_KEYS.detail(id),
    queryFn: () => assessmentApi.getAssessmentById(id),
    enabled: !!id,
  });
};

export const useAssessmentSessions = (assessmentId: string, filters?: SessionFilters) => {
  return useQuery({
    queryKey: ASSESSMENT_QUERY_KEYS.sessions(assessmentId),
    queryFn: () => assessmentApi.getAssessmentSessions(assessmentId, filters),
    enabled: !!assessmentId,
  });
};

export const useSession = (sessionId: string) => {
  return useQuery({
    queryKey: ASSESSMENT_QUERY_KEYS.session(sessionId),
    queryFn: () => assessmentApi.getSessionById(sessionId),
    enabled: !!sessionId,
  });
};

export const useSessionChats = (sessionId: string) => {
  return useQuery({
    queryKey: ASSESSMENT_QUERY_KEYS.chats(sessionId),
    queryFn: () => assessmentApi.getSessionChats(sessionId),
    enabled: !!sessionId,
  });
};

export const useSessionResult = (sessionId: string) => {
  return useQuery({
    queryKey: ASSESSMENT_QUERY_KEYS.result(sessionId),
    queryFn: () => assessmentApi.getSessionResult(sessionId),
    enabled: !!sessionId,
  });
};

// Assessment mutations
export const useCreateAssessment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateAssessmentRequest) => assessmentApi.createAssessment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASSESSMENT_QUERY_KEYS.lists() });
    },
  });
};

export const useUpdateAssessment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAssessmentRequest }) => 
      assessmentApi.updateAssessment(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ASSESSMENT_QUERY_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: ASSESSMENT_QUERY_KEYS.lists() });
    },
  });
};

export const useDeleteAssessment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => assessmentApi.deleteAssessment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASSESSMENT_QUERY_KEYS.lists() });
    },
  });
};

// Session mutations
export const useStartSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ assessmentId, userId }: { assessmentId: string; userId: number }) => 
      assessmentApi.startSession(assessmentId, userId),
    onSuccess: (_, { assessmentId }) => {
      queryClient.invalidateQueries({ queryKey: ASSESSMENT_QUERY_KEYS.sessions(assessmentId) });
    },
  });
};

export const useUpdateSessionStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ sessionId, status }: { sessionId: string; status: AssessmentSessionStatus }) => 
      assessmentApi.updateSessionStatus(sessionId, status),
    onSuccess: (_, { sessionId }) => {
      queryClient.invalidateQueries({ queryKey: ASSESSMENT_QUERY_KEYS.session(sessionId) });
    },
  });
};

export const useAddChat = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ sessionId, chat }: { sessionId: string; chat: { role: string; content: string } }) => 
      assessmentApi.addChat(sessionId, chat),
    onSuccess: (_, { sessionId }) => {
      queryClient.invalidateQueries({ queryKey: ASSESSMENT_QUERY_KEYS.chats(sessionId) });
    },
  });
};

export const useGenerateReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (sessionId: string) => assessmentApi.generateReport(sessionId),
    onSuccess: (_, sessionId) => {
      queryClient.invalidateQueries({ queryKey: ASSESSMENT_QUERY_KEYS.result(sessionId) });
    },
  });
};