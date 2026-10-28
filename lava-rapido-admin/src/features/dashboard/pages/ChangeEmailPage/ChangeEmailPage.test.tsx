import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AxiosError } from "axios";
import { useAuthStore } from "@/store/authStore";
import { LoginPage } from "@/features/auth/pages/LoginPage/LoginPage";

const changeEmail = vi.hoisted(() => vi.fn());
vi.mock("../../services/userService", () => ({ changeEmail }));
import { ChangeEmailPage } from "./ChangeEmailPage";

describe("ChangeEmailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().setAuth("token", { userId: "admin-1", firstName: "Admin", email: "old@example.com", role: "ADMIN" });
    changeEmail.mockResolvedValue({ email: "new@example.com" });
  });

  it("matches mobile behavior: validates, submits immediately, then closes the session", async () => {
    render(<MemoryRouter initialEntries={["/dashboard/cambiar-correo"]}><Routes>
      <Route path="/dashboard/cambiar-correo" element={<ChangeEmailPage />} />
      <Route path="/login" element={<LoginPage />} />
    </Routes></MemoryRouter>);

    fireEvent.change(screen.getByLabelText("Nuevo correo electrónico"), { target: { value: " NEW@example.com " } });
    fireEvent.change(screen.getByLabelText("Contraseña actual"), { target: { value: "secret" } });
    fireEvent.click(screen.getByRole("button", { name: "Actualizar correo" }));
    await waitFor(() => expect(changeEmail).toHaveBeenCalledWith("new@example.com", "secret"));
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(await screen.findByRole("status")).toHaveTextContent("Correo actualizado a new@example.com");
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
    expect(sessionStorage.getItem("user")).not.toContain("BrowserFilledSecret1");
    expect(localStorage.getItem("user")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Mostrar contraseña" }));
    expect(password).toHaveAttribute("type", "text");
    fireEvent.click(screen.getByRole("button", { name: "Ocultar contraseña" }));
    expect(password).toHaveAttribute("type", "password");
  });

  it("shows Spanish format validation, trims outer spaces on blur and allows correcting the address", async () => {
    render(<MemoryRouter initialEntries={["/dashboard/cambiar-correo"]}><Routes>
      <Route path="/dashboard/cambiar-correo" element={<ChangeEmailPage />} />
      <Route path="/login" element={<LoginPage />} />
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
    await waitFor(() => expect(changeEmail).toHaveBeenCalledWith("corrected@example.com", "secret"));
  });

  it("matches the mobile email format validation and rejects malformed domains", () => {
    render(<MemoryRouter initialEntries={["/dashboard/cambiar-correo"]}><Routes>
      <Route path="/dashboard/cambiar-correo" element={<ChangeEmailPage />} />
    </Routes></MemoryRouter>);
    fireEvent.change(screen.getByLabelText("Nuevo correo electrónico"), { target: { value: "person@-example.com" } });
    fireEvent.change(screen.getByLabelText("Contraseña actual"), { target: { value: "secret" } });
    fireEvent.click(screen.getByRole("button", { name: "Actualizar correo" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Ingresa un correo electrónico válido de máximo 100 caracteres.");
    expect(changeEmail).not.toHaveBeenCalled();
  });

  it("shows a localized network error and preserves entered fields", async () => {
    changeEmail.mockRejectedValueOnce(new AxiosError("network failure", "ERR_NETWORK"));
    render(<MemoryRouter initialEntries={["/dashboard/cambiar-correo"]}><Routes>
      <Route path="/dashboard/cambiar-correo" element={<ChangeEmailPage />} />
      <Route path="/login" element={<LoginPage />} />
    </Routes></MemoryRouter>);
    const email = screen.getByLabelText("Nuevo correo electrónico");
    const password = screen.getByLabelText("Contraseña actual");
    fireEvent.change(email, { target: { value: "new@example.com" } });
    fireEvent.change(password, { target: { value: "secret" } });
    fireEvent.click(screen.getByRole("button", { name: "Actualizar correo" }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("No pudimos conectarnos al servidor."));
    expect(email).toHaveValue("new@example.com");
    expect(password).toHaveValue("secret");
    expect(useAuthStore.getState().token).toBe("token");
  });

  it("keeps the session and entered values when the backend rejects the current password", async () => {
    changeEmail.mockRejectedValueOnce(new AxiosError("bad request", "ERR_BAD_REQUEST", undefined, undefined, {
      data: { error: "CURRENT_PASSWORD_INVALID" },
      status: 400,
      statusText: "Bad Request",
      headers: {},
      config: {} as never,
    }));
    render(<MemoryRouter initialEntries={["/dashboard/cambiar-correo"]}><Routes>
      <Route path="/dashboard/cambiar-correo" element={<ChangeEmailPage />} />
    </Routes></MemoryRouter>);
    const email = screen.getByLabelText("Nuevo correo electrónico");
    const password = screen.getByLabelText("Contraseña actual");
    fireEvent.change(email, { target: { value: "new@example.com" } });
    fireEvent.change(password, { target: { value: "incorrect" } });
    fireEvent.click(screen.getByRole("button", { name: "Actualizar correo" }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("La contraseña actual es incorrecta."));
    expect(email).toHaveValue("new@example.com");
    expect(password).toHaveValue("incorrect");
    expect(useAuthStore.getState().token).toBe("token");
  });

  it("prevents simultaneous submissions and reflects the loading state", async () => {
    let resolveChange: ((value: { email: string }) => void) | undefined;
    changeEmail.mockImplementation(() => new Promise((resolve) => { resolveChange = resolve; }));
    render(<MemoryRouter initialEntries={["/dashboard/cambiar-correo"]}><Routes>
      <Route path="/dashboard/cambiar-correo" element={<ChangeEmailPage />} />
      <Route path="/login" element={<LoginPage />} />
    </Routes></MemoryRouter>);
    fireEvent.change(screen.getByLabelText("Nuevo correo electrónico"), { target: { value: "new@example.com" } });
    fireEvent.change(screen.getByLabelText("Contraseña actual"), { target: { value: "secret" } });
    fireEvent.click(screen.getByRole("button", { name: "Actualizar correo" }));
    const loadingButton = screen.getByRole("button", { name: "Actualizando…" });
    expect(loadingButton).toHaveAttribute("aria-busy", "true");
    expect(loadingButton).toBeDisabled();
    expect(loadingButton.querySelector("svg.change-email-spinner")).toBeInTheDocument();
    expect(changeEmail).toHaveBeenCalledTimes(1);
    fireEvent.submit(loadingButton.closest("form") as HTMLFormElement);
    expect(changeEmail).toHaveBeenCalledTimes(1);
    resolveChange?.({ email: "new@example.com" });
    expect(await screen.findByRole("status")).toHaveTextContent("Correo actualizado a new@example.com");
  });
});
