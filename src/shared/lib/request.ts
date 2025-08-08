// shared/lib/request.ts
import apiClient from './axios';

export const fetcher = (url: string) => apiClient.get(url).then(res => res.data);

export const createAPIRequest = {
  get: <T = any>(url: string, config?: any) => apiClient.get<T>(url, config).then(res => res.data),
  post: <T = any>(url: string, data?: any, config?: any) => apiClient.post<T>(url, data, config).then(res => res.data),
  put: <T = any>(url: string, data?: any, config?: any) => apiClient.put<T>(url, data, config).then(res => res.data),
  patch: <T = any>(url: string, data?: any, config?: any) => apiClient.patch<T>(url, data, config).then(res => res.data),
  delete: <T = any>(url: string, config?: any) => apiClient.delete<T>(url, config).then(res => res.data),
};