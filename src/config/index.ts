interface AppConfig {
  api: {
    baseUrl: string;
    timeout: number;
  };
  auth: {
    tokenKey: string;
  };
  app: {
    name: string;
    env: 'development' | 'production' | 'test';
  };
}

const config: AppConfig = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://n8n.demodev.io/backend-api/v1',
    timeout: Number(process.env.NEXT_PUBLIC_API_TIMEOUT) || 10000,
  },
  auth: {
    tokenKey: 'access_token',
  },
  app: {
    name: 'Real Coaching',
    env: (process.env.NODE_ENV || 'development') as AppConfig['app']['env'],
  },
};

export default config;

export const API_BASE_URL = config.api.baseUrl;
export const API_TIMEOUT = config.api.timeout;
export const TOKEN_KEY = config.auth.tokenKey;
export const APP_NAME = config.app.name;
export const APP_ENV = config.app.env;

export const isDevelopment = () => config.app.env === 'development';
export const isProduction = () => config.app.env === 'production';
export const isTest = () => config.app.env === 'test';