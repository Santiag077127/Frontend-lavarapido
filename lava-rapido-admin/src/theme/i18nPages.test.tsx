import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useContext } from "react";
import { Link, MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import LandingPage from "@/features/auth/pages/LandingPage/Landing";
import { LoginPage } from "@/features/auth/pages/LoginPage/LoginPage";
import { RegisterPage } from "@/features/auth/pages/RegisterPage/RegisterPage";
import { ForgotPasswordPage } from "@/features/auth/pages/ForgotPasswordPage/ForgotPasswordPage";
import { ResetPasswordPage } from "@/features/auth/pages/ResetPasswordPage/ResetPasswordPage";
import { AccessDeniedPage } from "@/router/AccessDeniedPage";
import { ConfiguracionPage } from "@/features/dashboard/pages/ConfiguracionPage/ConfiguracionPage";
import { ChangePasswordPage } from "@/features/dashboard/pages/ChangePasswordPage/ChangePasswordPage";
import { Sidebar } from "@/features/dashboard/components/Sidebar";
import { ServiciosPage } from "@/features/dashboard/pages/ServiciosPage";
import { VehiculosPage } from "@/features/dashboard/pages/VehiculosPage";
import { MarcasPage } from "@/features/dashboard/pages/MarcasPage";
import { OperadoresPage } from "@/features/dashboard/pages/OperadoresPage/OperadoresPage";
import { TurnosPage } from "@/features/dashboard/pages/TurnosPage/TurnosPage";
import { PanelPrincipalPage } from "@/features/dashboard/pages/PanelPrincipalPage";
import { PerfilPage } from "@/features/dashboard/pages/PerfilPage";
import { MapsPage } from "@/features/dashboard/pages/MapsPage/MapsPage";
import { PagoResultadoPage } from "@/features/dashboard/pages/PagoResultadoPage/PagoResultadoPage";
import { useAuthStore } from "@/store/authStore";
import { ThemeContext, ThemeProvider, translations, type LanguageOption } from "./theme";

vi.mock("@/features/dashboard/services/servicioService", () => ({
  getServicios: vi.fn().mockResolvedValue([]), getServiciosDisponibles: vi.fn().mockResolvedValue([]),
  createServicio: vi.fn(), updateServicio: vi.fn(), cambiarEstadoServicio: vi.fn(),
}));
vi.mock("@/features/dashboard/services/reservaService", () => ({
  listarReservas: vi.fn().mockResolvedValue([]), crearReserva: vi.fn(), cambiarEstado: vi.fn(),
}));
vi.mock("@/features/dashboard/services/vehiculoService", () => ({ getVehiculos: vi.fn().mockResolvedValue([]) }));
vi.mock("@/features/dashboard/services/marcaService", () => ({ getMarcas: vi.fn().mockResolvedValue([]), createMarca: vi.fn() }));
vi.mock("@/features/dashboard/services/operadorService", () => ({
  listarOperadores: vi.fn().mockResolvedValue([]), crearOperador: vi.fn(), cambiarEstadoOperador: vi.fn(),
  desactivarTodosOperadores: vi.fn(), crearAsignacion: vi.fn(),
}));
vi.mock("@/features/dashboard/services/userService", () => ({
  getProfile: vi.fn().mockResolvedValue({ firstName: "Ada", lastName: "Lovelace", phoneNumber: "3101234567", email: "ada@example.com", profilePicture: "avatar_1" }),
  updateProfile: vi.fn(), changePassword: vi.fn(),
}));

function LanguageControl() {
  const theme = useContext(ThemeContext)!;
  return <select aria-label="test language" value={theme.language} onChange={(e) => theme.setLanguage(e.target.value as LanguageOption)}>
    <option value="es">es</option><option value="en">en</option><option value="fr">fr</option><option value="pt">pt</option>
  </select>;
}

function NavigateForTest() {
  return <nav aria-label="test routes">
    {["/", "/login", "/register", "/forgot-password", "/reset-password", "/access-denied", "/dashboard/configuracion", "/dashboard/cambiar-contrasena", "/dashboard/panel", "/dashboard/servicios", "/dashboard/vehiculos", "/dashboard/marcas", "/dashboard/operadores", "/dashboard/turnos", "/dashboard/maps", "/dashboard/perfil", "/pagos/resultado"].map((path) =>
      <Link key={path} to={path} aria-label={`go ${path}`}>{path}</Link>)}
  </nav>;
}

describe("language changes across admin routes", () => {
  it("updates public pages while navigating without a reload", () => {
    render(<ThemeProvider><MemoryRouter initialEntries={["/"]}><LanguageControl /><NavigateForTest /><Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/access-denied" element={<AccessDeniedPage />} />
    </Routes></MemoryRouter></ThemeProvider>);
    expect(screen.getByRole("heading", { name: "Administra tu lavadero desde un solo lugar" })).toBeTruthy();
    fireEvent.change(screen.getByLabelText("test language"), { target: { value: "en" } });
    expect(screen.getByRole("heading", { name: "Manage your car wash from one place" })).toBeTruthy();
    expect(screen.getByText("Today's dashboard")).toBeTruthy();
    useAuthStore.setState({ token: "test-token", user: { userId: "admin", firstName: "Ada", email: "ada@example.com", role: "ADMIN" } });
    for (const [route, heading] of [
      ["/login", "Admin access"], ["/register", "Create account"],
      ["/forgot-password", "Reset password"], ["/reset-password", "Invalid link"],
      ["/access-denied", "Access denied"],
    ]) {
      fireEvent.click(screen.getByLabelText(`go ${route}`));
      expect(screen.getByRole("heading", { name: heading })).toBeTruthy();
    }
    useAuthStore.getState().logout();
  });

  it("updates settings, sidebar, password form and an open modal", async () => {
    render(<ThemeProvider><MemoryRouter initialEntries={["/dashboard/configuracion"]}><LanguageControl /><NavigateForTest /><Sidebar /><Routes>
      <Route path="/dashboard/configuracion" element={<ConfiguracionPage />} />
      <Route path="/dashboard/cambiar-contrasena" element={<ChangePasswordPage />} />
      <Route path="/dashboard/panel" element={<PanelPrincipalPage />} />
      <Route path="/dashboard/servicios" element={<ServiciosPage />} />
      <Route path="/dashboard/vehiculos" element={<VehiculosPage />} />
      <Route path="/dashboard/marcas" element={<MarcasPage />} />
      <Route path="/dashboard/operadores" element={<OperadoresPage />} />
      <Route path="/dashboard/turnos" element={<TurnosPage />} />
      <Route path="/dashboard/maps" element={<MapsPage />} />
      <Route path="/dashboard/perfil" element={<PerfilPage />} />
      <Route path="/pagos/resultado" element={<PagoResultadoPage />} />
    </Routes></MemoryRouter></ThemeProvider>);
    fireEvent.change(screen.getByLabelText("test language"), { target: { value: "en" } });
    expect(screen.getByRole("heading", { name: "Settings" })).toBeTruthy();
    expect(screen.getByText("Home")).toBeTruthy();
    expect(screen.queryByRole("link", { name: "Notifications" })).toBeNull();
    fireEvent.click(screen.getByLabelText("go /dashboard/cambiar-contrasena"));
    expect(screen.getByRole("heading", { name: "Change password" })).toBeTruthy();
    fireEvent.click(screen.getByLabelText("go /dashboard/configuracion"));
    fireEvent.click(screen.getByRole("button", { name: "Sign out" }));
    expect(screen.getByText("Do you want to sign out?")).toBeTruthy();
    fireEvent.change(screen.getByLabelText("test language"), { target: { value: "fr" } });
    expect(screen.getByText("Voulez-vous fermer la session ?")).toBeTruthy();
    fireEvent.change(screen.getByLabelText("test language"), { target: { value: "pt" } });
    expect(screen.getByText("Deseja encerrar a sessão?")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    fireEvent.change(screen.getByLabelText("test language"), { target: { value: "en" } });
    useAuthStore.setState({ token: "test-token", user: { userId: "admin", firstName: "Ada", email: "ada@example.com", role: "ADMIN" } });
    for (const [route, key] of [
      ["/dashboard/panel", "panel.title"], ["/dashboard/servicios", "services.title"],
      ["/dashboard/vehiculos", "vehicles.title"], ["/dashboard/marcas", "brands.title"],
      ["/dashboard/operadores", "operators.title"], ["/dashboard/turnos", "turns.title"],
      ["/dashboard/maps", "map.title"], ["/dashboard/perfil", "profile.title"],
      ["/pagos/resultado", "ui.resultado.del.pago"],
    ]) {
      fireEvent.click(screen.getByLabelText(`go ${route}`));
      expect(screen.getByRole("heading", { name: translations.en[key] })).toBeTruthy();
      const emptyKey: Record<string, string> = {
        "/dashboard/servicios": "common.noResults", "/dashboard/vehiculos": "vehicles.empty",
        "/dashboard/marcas": "brands.empty", "/dashboard/operadores": "operators.empty",
        "/dashboard/turnos": "common.noReservations",
      };
      if (emptyKey[route]) await waitFor(() => expect(screen.getByText(translations.en[emptyKey[route]])).toBeTruthy());
      if (route === "/dashboard/servicios") {
        fireEvent.click(screen.getByRole("button", { name: /New service/ }));
        fireEvent.change(screen.getByLabelText("test language"), { target: { value: "fr" } });
        expect(screen.getByRole("heading", { name: translations.fr["services.new"] })).toBeTruthy();
        fireEvent.change(screen.getByLabelText("test language"), { target: { value: "en" } });
      }
    }
  });
});
