import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { LoginForm } from "./components/LoginForm/LoginForm";
import { login } from "./services/authService";
import { AccessDeniedPage } from "@/router/AccessDeniedPage";
import { guardarDestinoTrasLogin } from "@/services/authRedirect";
import { useAuthStore } from "@/store/authStore";

vi.mock("./services/authService", () => ({ login: vi.fn() }));

const admin = { userId: "2", firstName: "Admin", email: "admin@example.test", role: "ADMIN" };
const operator = { userId: "1", firstName: "User", email: "user@example.test", role: "OPERATOR" };

const renderLogin = () => render(
  <MemoryRouter initialEntries={["/login"]}>
    <Routes>
      <Route path="/login" element={<LoginForm />} />
      <Route path="/access-denied" element={<AccessDeniedPage />} />
      <Route path="/dashboard/*" element={<p>Private dashboard</p>} />
    </Routes>
  </MemoryRouter>,
);

const submitLogin = () => {
  fireEvent.change(screen.getByLabelText("Correo electrónico"), { target: { value: "user@example.test" } });
  fireEvent.change(screen.getByLabelText("Contraseña"), { target: { value: "test-password" } });
  fireEvent.click(screen.getByRole("button", { name: "Iniciar sesión" }));
};

describe("admin login access", () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
    sessionStorage.clear();
    vi.mocked(login).mockReset();
  });

  it("explains denied access after a non-admin signs in without a pending route", async () => {
    vi.mocked(login).mockResolvedValue({ token: "operator-token", user: operator });
    renderLogin();
    submitLogin();
    expect(await screen.findByText("Acceso denegado")).toBeInTheDocument();
    expect(screen.queryByText("Private dashboard")).not.toBeInTheDocument();
    expect(useAuthStore.getState().user?.role).toBe("OPERATOR");
  });

  it("does not send a non-admin to a requested dashboard URL", async () => {
    guardarDestinoTrasLogin("/dashboard/operadores");
    vi.mocked(login).mockResolvedValue({ token: "operator-token", user: operator });
    renderLogin();
    submitLogin();
    expect(await screen.findByText("Acceso denegado")).toBeInTheDocument();
    expect(screen.queryByText("Private dashboard")).not.toBeInTheDocument();
  });

  it("returns an administrator to the requested dashboard URL", async () => {
    guardarDestinoTrasLogin("/dashboard/operadores");
    vi.mocked(login).mockResolvedValue({ token: "admin-token", user: admin });
    renderLogin();
    submitLogin();
    expect(await screen.findByText("Private dashboard")).toBeInTheDocument();
    expect(useAuthStore.getState().user?.role).toBe("ADMIN");
  });
});
