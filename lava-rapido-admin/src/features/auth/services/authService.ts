import { api } from "../../../services/api";
import type { RegisterPayload } from "../types";

export const login = async (email: string, password: string) => {
  const response = await api.post("/users/login", { email, password });
  return response.data;
};

// ── nuevo ──
export const register = async (data: RegisterPayload) => {
  const response = await api.post("/users/register", data);
  return response.data;
};