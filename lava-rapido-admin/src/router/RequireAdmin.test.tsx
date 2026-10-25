import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { RequireAdmin } from "./RequireAdmin";
import { AccessDeniedPage } from "./AccessDeniedPage";

vi.mock("@/services/api", () => ({ api: { get: vi.fn() } }));

const admin = { userId: "2", firstName: "Admin", email: "admin@example.test", role: "ADMIN" } as const;
const operator = { userId: "1", firstName: "User", email: "user@example.test", role: "OPERATOR" } as const;

const renderRoute = (path = "/dashboard") => render(
  <MemoryRouter initialEntries={[path]}>
    <Routes>
      <Route path="/login" element={<p>Login destination</p>} />
      <Route path="/access-denied" element={<AccessDeniedPage />} />
      <Route element={<RequireAdmin />}>
        <Route path="/dashboard" element={<p>Private dashboard</p>} />
        <Route path="/dashboard/operadores" element={<p>Private operators</p>} />
      </Route>
    </Routes>
  </MemoryRouter>,
);

describe("RequireAdmin", () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
    vi.mocked(api.get).mockReset();
    sessionStorage.clear();
  });

  it("sends visitors without a session to login", () => {
    renderRoute();
    expect(screen.getByText("Login destination")).toBeInTheDocument();
    expect(api.get).not.toHaveBeenCalled();
  });

  it("sends unauthenticated visitors away from the denied page", () => {
    renderRoute("/access-denied");
    expect(screen.getByText("Login destination")).toBeInTheDocument();
    expect(screen.queryByText("Acceso denegado")).not.toBeInTheDocument();
  });

  it("does not trust an ADMIN role stored in the browser", async () => {
    useAuthStore.getState().setAuth("test-token", admin);
    vi.mocked(api.get).mockResolvedValue({ data: operator });
    renderRoute();
    expect(await screen.findByText("Acceso denegado")).toBeInTheDocument();
    expect(screen.queryByText("Private dashboard")).not.toBeInTheDocument();
  });

  it("allows the dashboard only after the API confirms ADMIN", async () => {
    useAuthStore.getState().setAuth("test-token", admin);
    vi.mocked(api.get).mockResolvedValue({ data: admin });
    renderRoute();
    expect(await screen.findByText("Private dashboard")).toBeInTheDocument();
    expect(api.get).toHaveBeenCalledWith("/users/me");
  });

  it("hides the dashboard while checking a replacement token", async () => {
    useAuthStore.getState().setAuth("admin-token", admin);
    vi.mocked(api.get).mockResolvedValueOnce({ data: admin });
    renderRoute();
    expect(await screen.findByText("Private dashboard")).toBeInTheDocument();

    vi.mocked(api.get).mockImplementationOnce(() => new Promise(() => {}));
    act(() => useAuthStore.getState().setAuth("other-token", operator));
    expect(screen.queryByText("Private dashboard")).not.toBeInTheDocument();
    expect(screen.getByText(/Verificando permisos/)).toBeInTheDocument();
  });

  it("keeps a direct private route hidden while checking the session", () => {
    useAuthStore.getState().setAuth("test-token", admin);
    vi.mocked(api.get).mockImplementation(() => new Promise(() => {}));
    renderRoute("/dashboard/operadores");
    expect(screen.getByText(/Verificando permisos/)).toBeInTheDocument();
    expect(screen.queryByText("Private operators")).not.toBeInTheDocument();
  });

  it("rejects a direct private route for a non-admin and permits logout", async () => {
    useAuthStore.getState().setAuth("test-token", operator);
    vi.mocked(api.get).mockResolvedValue({ data: operator });
    renderRoute("/dashboard/operadores");
    expect(await screen.findByText("Acceso denegado")).toBeInTheDocument();
    expect(screen.queryByText("Private operators")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Cerrar sesión" }));
    expect(useAuthStore.getState().token).toBeNull();
    expect(screen.getByText("Login destination")).toBeInTheDocument();
    expect(api.get).toHaveBeenCalledTimes(1);
  });

  it("treats a 403 as denied without clearing the session", async () => {
    useAuthStore.getState().setAuth("test-token", admin);
    vi.mocked(api.get).mockRejectedValue({ response: { status: 403 } });
    renderRoute();
    expect(await screen.findByText("Acceso denegado")).toBeInTheDocument();
    expect(useAuthStore.getState().token).toBe("test-token");
    expect(screen.queryByText("Private dashboard")).not.toBeInTheDocument();
    expect(api.get).toHaveBeenCalledTimes(1);
  });

  it("returns to login when a protected request expires the session", async () => {
    useAuthStore.getState().setAuth("expired-token", admin);
    vi.mocked(api.get).mockImplementation(async () => {
      act(() => useAuthStore.getState().logout());
      throw { response: { status: 401 } };
    });
    renderRoute();
    expect(await screen.findByText("Login destination")).toBeInTheDocument();
    expect(screen.queryByText("Acceso denegado")).not.toBeInTheDocument();
    expect(api.get).toHaveBeenCalledTimes(1);
  });
});
