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
});
