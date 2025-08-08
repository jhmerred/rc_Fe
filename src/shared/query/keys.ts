const serializeFilters = (filters?: any): string => {
  if (!filters || Object.keys(filters).length === 0) {
    return 'all';
  }
  
  const sortedFilters = Object.keys(filters)
    .sort()
    .reduce((acc, key) => {
      if (filters[key] !== undefined && filters[key] !== null) {
        acc[key] = filters[key];
      }
      return acc;
    }, {} as Record<string, any>);
  
  return JSON.stringify(sortedFilters);
};

export const queryKeys = {
  auth: {
    all: ['auth'] as const,
    user: () => [...queryKeys.auth.all, 'user'] as const,
    session: () => [...queryKeys.auth.all, 'session'] as const,
  },

  user: {
    all: ['user'] as const,
    lists: () => [...queryKeys.user.all, 'list'] as const,
    list: (filters?: any) => [...queryKeys.user.lists(), serializeFilters(filters)] as const,
    details: () => [...queryKeys.user.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.user.details(), id] as const,
    profile: (id: string) => [...queryKeys.user.all, 'profile', id] as const,
  },

  report: {
    all: ['report'] as const,
    lists: () => [...queryKeys.report.all, 'list'] as const,
    list: (filters?: any) => [...queryKeys.report.lists(), serializeFilters(filters)] as const,
    details: () => [...queryKeys.report.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.report.details(), id] as const,
  },

  chatbot: {
    all: ['chatbot'] as const,
    sessions: () => [...queryKeys.chatbot.all, 'session'] as const,
    session: (sessionId: string) => [...queryKeys.chatbot.sessions(), sessionId] as const,
    messages: (sessionId: string) => [...queryKeys.chatbot.all, 'messages', sessionId] as const,
  },

  group: {
    all: ['group'] as const,
    lists: () => [...queryKeys.group.all, 'list'] as const,
    list: (filters?: any) => [...queryKeys.group.lists(), serializeFilters(filters)] as const,
    details: () => [...queryKeys.group.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.group.details(), id] as const,
    members: (groupId: string) => [...queryKeys.group.all, 'members', groupId] as const,
  },
} as const;

export type QueryKeys = typeof queryKeys;