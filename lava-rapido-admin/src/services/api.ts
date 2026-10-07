// Librería para peticiones HTTP
import axios from "axios";
import { useAuthStore } from "@/store/authStore";
import { guardarDestinoTrasLogin } from "@/services/authRedirect";

const publicAuthPath = (path?: string) =>
  ["/users/login", "/users/register", "/auth/forgot-password", "/auth/reset-password"]
    .some((route) => path?.startsWith(route));
const configuredApiUrl = import.meta.env.VITE_API_URL || "http://localhost:8081/api";
// En desarrollo, Vite reenvía la API local por IPv4. Así el navegador no
// puede llegar por localhost/IPv6 a otro proceso que ocupe el mismo puerto.
const useLocalProxy = import.meta.env.DEV &&
  /^http:\/\/(?:localhost|127\.0\.0\.1):8081\/api\/?$/.test(configuredApiUrl);

// Instancia global de Axios
export const api = axios.create({
  // URL base del backend
  baseURL: useLocalProxy ? "/api" : configuredApiUrl,
});
// Interceptor antes de cada request
api.interceptors.request.use((config) => {
  // Obtener token guardado
  const token = sessionStorage.getItem("token");
  // Verificar si la ruta es pública
  const isAuthRoute = publicAuthPath(config.url);
  // Agregar token solo a rutas protegidas
  if (token && !isAuthRoute) {
    // Header JWT estándar
    config.headers.Authorization =
      `Bearer ${token}`;
  }
  // Retornar request modificada
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !publicAuthPath(error.config?.url)) {
      guardarDestinoTrasLogin(`${window.location.pathname}${window.location.search}${window.location.hash}`);
      useAuthStore.getState().logout();
      window.dispatchEvent(new Event("api:unauthorized"));
    } else if (error.response?.status === 403) {
      window.dispatchEvent(new Event("api:forbidden"));
    }
    return Promise.reject(error);
  }
);
