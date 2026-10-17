import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/store/authStore";

const services = vi.hoisted(() => ({ get: vi.fn(), update: vi.fn(), email: vi.fn(), login: vi.fn() }));
vi.mock("../../services/userService", () => ({ getProfile: services.get, updateProfile: services.update, changeEmail: services.email }));
vi.mock("@/features/auth/services/authService", () => ({ login: services.login }));
import { PerfilPage } from "./index";

const profile = { userId: "user-1", firstName: "Maria", lastName: "Perez", email: "old@example.com", phoneNumber: "3001234567", profilePicture: "avatar_1" };

describe("PerfilPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().setAuth("old-token", { userId: "user-1", firstName: "Maria", email: profile.email, role: "ADMIN" });
    services.get.mockResolvedValueOnce(profile).mockResolvedValueOnce({ ...profile, email: "new@example.com" });
    services.update.mockResolvedValue(profile);
    services.email.mockResolvedValue({ ...profile, email: "new@example.com" });
    services.login.mockResolvedValue({ token: "new-token", user: { userId: "user-1", firstName: "Maria", email: "new@example.com", role: "ADMIN" } });
  });

  it("guarda el correo, renueva la sesi?n y recarga el perfil", async () => {
    const { container } = render(<MemoryRouter><PerfilPage /></MemoryRouter>);
    await screen.findByDisplayValue("old@example.com");
    expect(container.querySelector('input[name="email"]')).toHaveAttribute("readonly");
    expect(screen.getByRole("link", { name: /cambiar correo/i })).toHaveAttribute("href", "/dashboard/cambiar-correo");
    expect(services.email).not.toHaveBeenCalled();
  });
});
