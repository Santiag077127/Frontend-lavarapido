import { api } from "../../../services/api";
import type {
  RegisterPayload,
  ForgotPasswordPayload,
  ForgotPasswordResponse,
  ResetPasswordPayload,
  ResetPasswordResponse,
} from "../types";

export const login = async (email: string, password: string) => {
  const response = await api.post("/users/login", { email, password });
  return response.data;
};

export const register = async (data: RegisterPayload) => {
  const response = await api.post("/users/register", data);
  return response.data;
};

// ── nuevo: recuperar contraseña ──

// Paso 1: el usuario pide el enlace de recuperación con su correo.
// El backend siempre responde 200 con un mensaje genérico, exista o no
// el correo (para no revelar qué correos están registrados).
export const forgotPassword = async (
  email: string,
): Promise<ForgotPasswordResponse> => {
  const payload: ForgotPasswordPayload = { email };
  const response = await api.post<ForgotPasswordResponse>("/auth/forgot-password", payload);
  return response.data;
};

// Paso 2: el usuario llega desde el correo con un token (?token=...) y
// define su nueva contraseña. El token expira a los 30 min y es de un solo uso.
export const resetPassword = async (token: string, nuevaContrasena: string) => {
  const payload: ResetPasswordPayload = { token, nuevaContrasena };
  const response = await api.post<ResetPasswordResponse>("/auth/reset-password", payload);
  return response.data;
};
