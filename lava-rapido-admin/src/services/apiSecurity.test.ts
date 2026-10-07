import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "./api";
import { useAuthStore } from "@/store/authStore";

const failedRequest = (path: string, status: number) => api.get(path, {
  adapter: async (config) => { throw { response: { status }, config }; },
});

describe("respuestas de autorización de la API", () => {
  beforeEach(() => useAuthStore.getState().logout());

  it("un 401 del login no destruye una sesión ni cambia de ruta", async () => {
    useAuthStore.getState().setAuth("test-token", { userId: "1", firstName: "A", email: "a@example.test", role: "ADMIN" });
    const listener = vi.fn();
    window.addEventListener("api:unauthorized", listener);
    await expect(failedRequest("/users/login", 401)).rejects.toBeDefined();
    expect(useAuthStore.getState().token).toBe("test-token");
    expect(listener).not.toHaveBeenCalled();
    window.removeEventListener("api:unauthorized", listener);
  });

  it("un 401 protegido cierra la sesión", async () => {
    useAuthStore.getState().setAuth("test-token", { userId: "1", firstName: "A", email: "a@example.test", role: "ADMIN" });
    const listener = vi.fn();
    window.addEventListener("api:unauthorized", listener);
    await expect(failedRequest("/users/me", 401)).rejects.toBeDefined();
    expect(useAuthStore.getState().token).toBeNull();
    expect(listener).toHaveBeenCalledOnce();
    window.removeEventListener("api:unauthorized", listener);
  });

  it("un 403 conserva la sesión e informa acceso denegado", async () => {
    useAuthStore.getState().setAuth("test-token", { userId: "1", firstName: "A", email: "a@example.test", role: "ADMIN" });
    const listener = vi.fn();
    window.addEventListener("api:forbidden", listener);
    await expect(failedRequest("/operadores", 403)).rejects.toBeDefined();
    expect(useAuthStore.getState().token).toBe("test-token");
    expect(listener).toHaveBeenCalledOnce();
    window.removeEventListener("api:forbidden", listener);
  });
});
