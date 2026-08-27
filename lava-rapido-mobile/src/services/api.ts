/**
 * api.ts
 * Comunicación entre React Native y Spring Boot
 */

import axios from 'axios';

let token: string | null = null;

export const setToken = (newToken: string | null) => {
  token = newToken;
};

let onLogout: (() => void) | null = null;

export const setLogoutHandler = (callback: () => void) => {
  onLogout = callback;
};

const api = axios.create({
  baseURL: 'http://192.168.100.199:8081',
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
    if (error.response?.status === 401) {
      if (onLogout) {
        onLogout();
      }
    }

    return Promise.reject(error);
  }
);

export default api;