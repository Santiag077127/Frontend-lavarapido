
/**
 * api.ts
 * Comunicación entre React Native y Spring Boot
 */

import axios from 'axios';
import { resolveApiUrl } from './apiUrl.ts';
import { shouldAttachAuthorization } from './passwordResetRequest.ts';

export { shouldAttachAuthorization } from './passwordResetRequest.ts';
export { classifyApiError } from './apiErrors.ts';
export type { ApiErrorKind } from './apiErrors.ts';

let token: string | null = null;
let sessionGeneration = 0;

export const setToken = (newToken: string | null) => {
  token = newToken;
  sessionGeneration += 1;
  if (newToken) logoutInProgress = false;
};
export const getToken = () => token;

let onLogout: (() => void) | null = null;
let logoutInProgress = false;
const requestSessions = new WeakMap<object, number>();

export const setLogoutHandler = (callback: (() => void) | null) => {
  onLogout = callback;
};

export const invalidateSession = () => {
  if (!token || logoutInProgress) return;

  logoutInProgress = true;
  token = null;
  sessionGeneration += 1;
  onLogout?.();
};

const api = axios.create({
  baseURL: resolveApiUrl(process.env.EXPO_PUBLIC_API_URL, __DEV__),
  // Allow a Render cold start without retrying non-idempotent requests.
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    if (token && shouldAttachAuthorization(config.url) && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (token) requestSessions.set(config, sessionGeneration);

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url?.split(/[?#]/, 1)[0].replace(/\/$/, '');
    const isLoginRequest = requestUrl?.endsWith('/api/users/login');
    const requestToken = error.config?.headers?.Authorization;
    const requestGeneration = error.config && requestSessions.get(error.config);
    if (error.response?.status === 401 && token && requestToken === `Bearer ${token}`
        && requestGeneration === sessionGeneration
        && !isLoginRequest && !logoutInProgress) {
      invalidateSession();
    }

    return Promise.reject(error);
  }
);

export default api;
