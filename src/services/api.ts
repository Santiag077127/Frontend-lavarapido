// Librería para peticiones HTTP
import axios from "axios";
// Instancia global de Axios
export const api = axios.create({
  // URL base del backend
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://localhost:8081/api",
});
// Interceptor antes de cada request
api.interceptors.request.use((config) => {
  // Obtener token guardado
  const token = localStorage.getItem("token");
  // Verificar si la ruta es pública
  const isAuthRoute =
    config.url?.includes("/users/login") ||
    config.url?.includes("/users/register");
  // Agregar token solo a rutas protegidas
  if (token && !isAuthRoute) {
    // Header JWT estándar
    config.headers.Authorization =
      `Bearer ${token}`;
  }
  // Retornar request modificada
  return config;
});