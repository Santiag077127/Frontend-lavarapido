/**
 * api.ts — Singleton Axios con interceptores HTTPS
 * Patrón: Singleton + Repository
 * RNF5: Toda comunicación via HTTPS
 * RNF7: Token JWT adjunto automáticamente
 */

import axios from 'axios';

// 🔐 Token manejado externamente (evita dependencia con Redux)
let token: string | null = null;

// 🔐 Setter para actualizar token desde Redux o login
export const setToken = (newToken: string | null) => {
  token = newToken;
};

// 🔐 Callback para manejar logout (sin depender del store)
let onLogout: (() => void) | null = null;

export const setLogoutHandler = (callback: () => void) => {
  onLogout = callback;
};

// 🌐 Instancia de Axios
const api = axios.create({
  baseURL: 'https://api.lavarapido.com/v1', // HTTPS obligatorio
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// 📤 Interceptor: agrega token automáticamente
api.interceptors.request.use((config) => {
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 📥 Interceptor: manejo global de errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (onLogout) {
        onLogout(); // 🔥 dispara logout desde Redux
      }
    }
    return Promise.reject(error);
  }
);

export default api;