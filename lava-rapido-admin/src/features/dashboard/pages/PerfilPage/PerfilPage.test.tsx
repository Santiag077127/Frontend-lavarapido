import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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

  it("shows the authenticated user's real name and no longer links to email changes", async () => {
    const { container } = render(<MemoryRouter><PerfilPage /></MemoryRouter>);
    await screen.findByDisplayValue("old@example.com");
    expect(screen.getByRole("heading", { name: "Maria Perez" })).toBeInTheDocument();
    expect(container.querySelector('input[name="email"]')).toHaveAttribute("readonly");
    expect(screen.queryByRole("link", { name: /cambiar correo/i })).not.toBeInTheDocument();
    expect(services.email).not.toHaveBeenCalled();
  });

  it("prevents emoji in names while preserving valid accented letters", async () => {
    render(<MemoryRouter><PerfilPage /></MemoryRouter>);
    const firstName = await screen.findByDisplayValue("Maria");
    fireEvent.change(firstName, { target: { value: "María🚗" } });
    expect(firstName).toHaveValue("Maria");
    expect(screen.getByText("Este campo no puede contener emojis.")).toBeInTheDocument();
    fireEvent.change(firstName, { target: { value: "João" } });
    expect(firstName).toHaveValue("João");
    await waitFor(() => expect(screen.queryByText("Este campo no puede contener emojis.")).not.toBeInTheDocument());
  });
});
