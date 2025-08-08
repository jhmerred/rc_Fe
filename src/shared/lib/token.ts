// shared/lib/token.ts
import { TOKEN_KEY } from '@/config';

export const getAccessToken = () => {
    return typeof window !== 'undefined'
      ? localStorage.getItem(TOKEN_KEY)
      : null;
  };

export const setAccessToken = (token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
};

export const clearAccessToken = () => {
    localStorage.removeItem(TOKEN_KEY);
};