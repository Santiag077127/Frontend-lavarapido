
/**
 * api.ts
 * Comunicación entre React Native y Spring Boot
 */

import axios from 'axios';

let token: string | null = null;

export const setToken = (newToken: string | null) => {
  token = newToken;

  console.log(
    'AUTH TOKEN:',
    newToken ? 'TOKEN GUARDADO' : 'TOKEN ELIMINADO'
  );
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
    console.log(
      'API REQUEST:',
      config.method?.toUpperCase(),
      config.url,
      'TOKEN:',
      token ? 'SI' : 'NO'
    );

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.log('API REQUEST ERROR:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log(
      'API RESPONSE:',
      response.status,
      response.config.url
    );

    return response;
  },

  (error) => {
    console.log(
      'API ERROR:',
      error.response?.status,
      error.config?.url
    );

    console.log(
      'API ERROR DATA:',
      error.response?.data
    );

    console.log(
      'API ERROR MESSAGE:',
      error.message
    );

    if (error.response?.status === 401) {
      if (onLogout) {
        onLogout();
      }
    }

    return Promise.reject(error);
  }
);

export default api;

