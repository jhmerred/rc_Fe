import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, API_TIMEOUT } from '@/config';
import { getAccessToken, setAccessToken, clearAccessToken } from './token';
import { snakeToCamel } from './caseConverter';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT,
    headers: {
    'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// 🔁 refresh 중복 방지용 상태 및 큐
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string | null) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown | null, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    error ? reject(error) : resolve(token);
  });
  failedQueue = [];
};

const attachAccessToken = (
  config: InternalAxiosRequestConfig,
  token: string
) => {
  if (config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
};

// ✅ 요청 인터셉터
apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) attachAccessToken(config, token);
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ 응답 인터셉터
apiClient.interceptors.response.use(
  (res) => {
    // auth 관련 엔드포인트의 응답만 변환
    if (res.config.url?.includes('/auth/')) {
      res.data = snakeToCamel(res.data);
    }
    return res;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // 🔒 토큰 만료 시
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              if (token) attachAccessToken(originalRequest, token);
              resolve(apiClient(originalRequest));
            },
            reject,
          });
        });
      }

      isRefreshing = true;

      try {
        const res = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        // refresh 응답도 스네이크 케이스를 카멜 케이스로 변환
        const convertedData = snakeToCamel(res.data);
        const { accessToken } = convertedData;
        setAccessToken(accessToken);
        processQueue(null, accessToken);
        attachAccessToken(originalRequest, accessToken);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAccessToken();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
