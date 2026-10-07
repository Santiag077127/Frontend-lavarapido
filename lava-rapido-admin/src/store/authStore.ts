// Crear store global con Zustand
import { create } from "zustand";

// Modelo del usuario autenticado
interface User {
  userId: string; // ID único
  firstName: string; // Nombre
  email: string; // Correo
  role: "ADMIN" | "USER" | "OPERATOR"; // Rol del sistema
}

const readStoredUser = (): User | null => {
  try {
    return JSON.parse(sessionStorage.getItem("user") || "null") as User | null;
  } catch {
    sessionStorage.removeItem("user");
    return null;
  }
};

// Discard tokens left by earlier builds that persisted credentials across browser sessions.
localStorage.removeItem("token");
localStorage.removeItem("user");

// Estado global de autenticación
export interface AuthState {
  token: string | null; // JWT
  user: User | null; // Usuario autenticado

  // Guardar sesión
  setAuth: (token: string, user: User) => void;

  // Cerrar sesión
  logout: () => void;
}

// Store global auth
export const useAuthStore = create<AuthState>((set) => ({

  // Recuperar sesión guardada
  token: sessionStorage.getItem("token"),
  user: readStoredUser(),

  // Login
  setAuth: (token, user) => {

    // Limitar la persistencia de la sesión a la pestaña actual.
    sessionStorage.setItem("token", token);
    sessionStorage.setItem("user", JSON.stringify(user));

    // Actualizar estado global
    set({ token, user });
  },

  // Logout
  logout: () => {

    // Limpiar almacenamiento
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    // Limpiar estado global
    set({ token: null, user: null });
  },
}));
