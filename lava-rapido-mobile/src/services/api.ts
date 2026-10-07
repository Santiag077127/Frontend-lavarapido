
/**
 * api.ts
 * Comunicación entre React Native y Spring Boot
 */

import axios from 'axios';
import { resolveApiUrl } from './apiUrl';

export type ApiErrorKind =
  | 'network'
  | 'timeout'
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'server'
  | 'unknown';

export function classifyApiError(error: unknown): ApiErrorKind {
  if (!axios.isAxiosError(error)) return 'unknown';

  if (!error.response) {
    return error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT'
      ? 'timeout'
      : 'network';
  }

  const status = error.response.status;
  if (status === 401) return 'unauthorized';
  if (status === 403) return 'forbidden';
  if (status === 404) return 'not_found';
  if (status >= 500) return 'server';
  return 'unknown';
}

let token: string | null = null;

export const setToken = (newToken: string | null) => {
  token = newToken;
  if (newToken) logoutInProgress = false;
};

let onLogout: (() => void) | null = null;
let logoutInProgress = false;

export const setLogoutHandler = (callback: () => void) => {
  onLogout = callback;
};

const api = axios.create({
  baseURL: resolveApiUrl(process.env.EXPO_PUBLIC_API_URL, __DEV__),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.replace(/\/$/, '').endsWith('/api/users/login');
    if (error.response?.status === 401 && token && !isLoginRequest && !logoutInProgress) {
      logoutInProgress = true;
      token = null;
      onLogout?.();
    }

    return Promise.reject(error);
  }
);

export default api;

