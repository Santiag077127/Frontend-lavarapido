import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/store/authStore";

const changeEmail = vi.hoisted(() => vi.fn());
vi.mock("../../services/userService", () => ({ changeEmail }));
import { ChangeEmailPage } from "./ChangeEmailPage";

describe("ChangeEmailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().setAuth("token", { userId: "admin-1", firstName: "Admin", email: "old@example.com", role: "ADMIN" });
    changeEmail.mockResolvedValue({ email: "new@example.com" });
  });

  it("exige contraseña y doble confirmación antes de cambiar el correo y cerrar sesión", async () => {
    render(<MemoryRouter initialEntries={["/dashboard/cambiar-correo"]}><Routes>
      <Route path="/dashboard/cambiar-correo" element={<ChangeEmailPage />} />
      <Route path="/login" element={<p>Inicio de sesión</p>} />
    </Routes></MemoryRouter>);

    fireEvent.change(screen.getByLabelText("Nuevo correo electrónico"), { target: { value: " NEW@example.com " } });
    fireEvent.change(screen.getByLabelText("Contraseña actual"), { target: { value: "secret" } });
    fireEvent.click(screen.getByRole("button", { name: "Actualizar correo" }));
    expect(changeEmail).not.toHaveBeenCalled();
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Sí, cambiar correo" }));
    await waitFor(() => expect(changeEmail).toHaveBeenCalledWith("new@example.com", "secret"));
    expect(await screen.findByText("Inicio de sesión")).toBeInTheDocument();
    expect(useAuthStore.getState().token).toBeNull();
  });

  it("rejects emoji in email addresses and preserves the entered value", () => {
    render(<MemoryRouter initialEntries={["/dashboard/cambiar-correo"]}><Routes>
      <Route path="/dashboard/cambiar-correo" element={<ChangeEmailPage />} />
    </Routes></MemoryRouter>);
    const email = screen.getByLabelText("Nuevo correo electrónico");
    fireEvent.change(email, { target: { value: "person🚗@example.com" } });
    fireEvent.change(screen.getByLabelText("Contraseña actual"), { target: { value: "secret" } });
    fireEvent.click(screen.getByRole("button", { name: "Actualizar correo" }));
    expect(email).toHaveValue("");
    expect(screen.getByRole("alert")).toHaveTextContent("El correo no puede contener emojis.");
    expect(changeEmail).not.toHaveBeenCalled();
  });

  it("keeps the settings link at the top and hides the current password by default", () => {
    const { container } = render(<MemoryRouter initialEntries={["/dashboard/cambiar-correo"]}><Routes>
      <Route path="/dashboard/cambiar-correo" element={<ChangeEmailPage />} />
      <Route path="/dashboard/configuracion" element={<p>Configuración</p>} />
    </Routes></MemoryRouter>);
    const backLink = screen.getByRole("link", { name: "Volver a configuración" });
    expect(container.querySelector("main > a.settings-back-link")).toBe(backLink);
    expect(screen.getByLabelText("Contraseña actual")).toHaveAttribute("type", "password");
    fireEvent.click(backLink);
    expect(screen.getByText("Configuración")).toBeInTheDocument();
  });

  it("keeps the current password masked after browser-style autofill", () => {
    render(<MemoryRouter initialEntries={["/dashboard/cambiar-correo"]}><Routes>
      <Route path="/dashboard/cambiar-correo" element={<ChangeEmailPage />} />
    </Routes></MemoryRouter>);
    const password = screen.getByLabelText("Contraseña actual");

    expect(password).toHaveAttribute("type", "password");
    expect(password).toHaveAttribute("autocomplete", "current-password");
    fireEvent.change(password, { target: { value: "BrowserFilledSecret1" } });

    expect(password).toHaveAttribute("type", "password");
    expect(password).toHaveValue("BrowserFilledSecret1");
  });

  it("shows Spanish format validation, trims outer spaces on blur and allows correcting the address", async () => {
    render(<MemoryRouter initialEntries={["/dashboard/cambiar-correo"]}><Routes>
      <Route path="/dashboard/cambiar-correo" element={<ChangeEmailPage />} />
    </Routes></MemoryRouter>);

    const email = screen.getByLabelText("Nuevo correo electrónico");
    fireEvent.change(email, { target: { value: "invalid-address" } });
    fireEvent.change(screen.getByLabelText("Contraseña actual"), { target: { value: "secret" } });
    fireEvent.click(screen.getByRole("button", { name: "Actualizar correo" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Ingresa un correo electrónico válido de máximo 100 caracteres.");
    expect(changeEmail).not.toHaveBeenCalled();

    fireEvent.change(email, { target: { value: "  corrected@example.com  " } });
    fireEvent.blur(email);
    expect(email).toHaveValue("corrected@example.com");
    fireEvent.click(screen.getByRole("button", { name: "Actualizar correo" }));
    fireEvent.click(screen.getByRole("button", { name: "Sí, cambiar correo" }));

    await waitFor(() => expect(changeEmail).toHaveBeenCalledWith("corrected@example.com", "secret"));
  });
});
