
/**
 * api.ts
 * Comunicación entre React Native y Spring Boot
 */

import axios from 'axios';
import { resolveApiUrl } from './apiUrl';

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

