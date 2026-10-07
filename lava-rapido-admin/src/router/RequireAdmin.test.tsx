import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { RequireAdmin } from "./RequireAdmin";

vi.mock("@/services/api", () => ({ api: { get: vi.fn() } }));

const renderRoute = () => render(
  <MemoryRouter initialEntries={["/dashboard"]}>
    <Routes>
      <Route path="/login" element={<p>Iniciar sesión</p>} />
      <Route path="/access-denied" element={<p>Sin permisos</p>} />
      <Route element={<RequireAdmin />}>
        <Route path="/dashboard" element={<p>Panel privado</p>} />
      </Route>
    </Routes>
  </MemoryRouter>,
);

describe("RequireAdmin", () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
    vi.mocked(api.get).mockReset();
  });

  it("envía a login cuando no hay sesión", () => {
    renderRoute();
    expect(screen.getByText("Iniciar sesión")).toBeInTheDocument();
    expect(api.get).not.toHaveBeenCalled();
  });

  it("no confía en un rol ADMIN guardado por el navegador", async () => {
    useAuthStore.getState().setAuth("test-token", { userId: "1", firstName: "User", email: "user@example.test", role: "ADMIN" });
    vi.mocked(api.get).mockResolvedValue({ data: { userId: "1", firstName: "User", email: "user@example.test", role: "USER" } });
    renderRoute();
    expect(await screen.findByText("Sin permisos")).toBeInTheDocument();
    expect(screen.queryByText("Panel privado")).not.toBeInTheDocument();
  });

  it("permite el panel solo tras validar ADMIN con la API", async () => {
    useAuthStore.getState().setAuth("test-token", { userId: "2", firstName: "Admin", email: "admin@example.test", role: "ADMIN" });
    vi.mocked(api.get).mockResolvedValue({ data: { userId: "2", firstName: "Admin", email: "admin@example.test", role: "ADMIN" } });
    renderRoute();
    expect(await screen.findByText("Panel privado")).toBeInTheDocument();
    expect(api.get).toHaveBeenCalledWith("/users/me");
  });

  it("oculta el panel mientras verifica un token que reemplaza al ya autorizado", async () => {
    useAuthStore.getState().setAuth("admin-token", { userId: "2", firstName: "Admin", email: "admin@example.test", role: "ADMIN" });
    vi.mocked(api.get).mockResolvedValueOnce({ data: { userId: "2", firstName: "Admin", email: "admin@example.test", role: "ADMIN" } });
    renderRoute();
    expect(await screen.findByText("Panel privado")).toBeInTheDocument();

    vi.mocked(api.get).mockImplementationOnce(() => new Promise(() => {}));
    act(() => useAuthStore.getState().setAuth("other-token", { userId: "3", firstName: "User", email: "user@example.test", role: "USER" }));
    expect(screen.queryByText("Panel privado")).not.toBeInTheDocument();
    expect(screen.getByText(/Verificando permisos/)).toBeInTheDocument();
  });
});
