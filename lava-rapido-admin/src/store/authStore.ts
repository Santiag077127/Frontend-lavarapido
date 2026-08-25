// Crear store global con Zustand
import { create } from "zustand";

// Modelo del usuario autenticado
interface User {
  userId: string; // ID único
  firstName: string; // Nombre
  email: string; // Correo
  role: "ADMIN" | "USER" | "OPERATOR"; // Rol del sistema
}

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
  token: localStorage.getItem("token"),
  user: JSON.parse(localStorage.getItem("user") || "null"),

  // Login
  setAuth: (token, user) => {

    // Guardar datos en localStorage
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    // Actualizar estado global
    set({ token, user });
  },

  // Logout
  logout: () => {

    // Limpiar almacenamiento
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Limpiar estado global
    set({ token: null, user: null });
  },
}));