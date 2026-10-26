// Prueba el comportamiento de cambio de contraseña de la cuenta.
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AxiosError } from "axios";

import { ChangePasswordPage, isValidNewPassword, passwordChangeErrorMessage } from "./ChangePasswordPage";
import { changePassword } from "../../services/userService";

vi.mock("../../services/userService", () => ({ changePassword: vi.fn() }));

const mockedChangePassword = vi.mocked(changePassword);
const renderPage = () => render(<MemoryRouter><ChangePasswordPage /></MemoryRouter>);

const fill = (current: string, next: string, confirmation: string) => {
  fireEvent.change(screen.getByLabelText("Contraseña actual"), { target: { value: current } });
  fireEvent.change(screen.getByLabelText("Nueva contraseña"), { target: { value: next } });
  fireEvent.change(screen.getByLabelText("Confirmar nueva contraseña"), { target: { value: confirmation } });
};

describe("ChangePasswordPage", () => {
  beforeEach(() => mockedChangePassword.mockReset());

  it("validates required fields, confirmation and the backend password limits", () => {
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: "Actualizar contraseña" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Completa todos los campos.");

    fill("CurrentPass1", "NuevaPass", "OtraPass1");
    fireEvent.click(screen.getByRole("button", { name: "Actualizar contraseña" }));
    expect(screen.getByRole("alert")).toHaveTextContent("La confirmación no coincide");

    expect(isValidNewPassword("12345678")).toBe(true);
    expect(isValidNewPassword("       ")).toBe(false);
    expect(isValidNewPassword("á".repeat(36))).toBe(true);
    expect(isValidNewPassword("á".repeat(37))).toBe(false);

    fill("CurrentPass1", "á".repeat(37), "á".repeat(37));
    fireEvent.click(screen.getByRole("button", { name: "Actualizar contraseña" }));
    expect(screen.getByRole("alert")).toHaveTextContent("La nueva contraseña es demasiado larga. Prueba una más corta.");
    expect(mockedChangePassword).not.toHaveBeenCalled();
  });

  it("sends the backend body once and clears passwords after success", async () => {
    mockedChangePassword.mockResolvedValue(undefined);
    renderPage();
    fill("CurrentPass1", "NuevaPass1", "NuevaPass1");
    fireEvent.click(screen.getByRole("button", { name: "Actualizar contraseña" }));

    await waitFor(() => expect(mockedChangePassword).toHaveBeenCalledWith({
      currentPassword: "CurrentPass1", newPassword: "NuevaPass1",
    }));
    expect(screen.getByRole("status")).toHaveTextContent("Contraseña actualizada correctamente.");
    expect(screen.getByLabelText("Contraseña actual")).toHaveValue("");
    expect(screen.getByLabelText("Nueva contraseña")).toHaveValue("");
  });

  it("keeps every password hidden initially and toggles each field independently", () => {
    renderPage();
    const current = screen.getByLabelText("Contraseña actual");
    const next = screen.getByLabelText("Nueva contraseña");
    const confirmation = screen.getByLabelText("Confirmar nueva contraseña");
    expect(current).toHaveAttribute("type", "password");
    expect(next).toHaveAttribute("type", "password");
    expect(confirmation).toHaveAttribute("type", "password");

    fireEvent.click(screen.getAllByRole("button", { name: "Mostrar contraseña" })[1]);
    expect(current).toHaveAttribute("type", "password");
    expect(next).toHaveAttribute("type", "text");
    expect(confirmation).toHaveAttribute("type", "password");
    expect(screen.getByRole("button", { name: "Ocultar contraseña" })).toHaveAttribute("aria-pressed", "true");
  });

  it("preserves legitimate password characters and validates the existing byte limit", () => {
    expect(isValidNewPassword("Clavé🚗12")).toBe(true);
    expect(isValidNewPassword("🚗".repeat(19))).toBe(false);
  });

  it("does not duplicate a request while it is pending", async () => {
    let resolveRequest: (() => void) | undefined;
    mockedChangePassword.mockReturnValue(new Promise<void>((resolve) => { resolveRequest = resolve; }));
    renderPage();
    fill("CurrentPass1", "NuevaPass1", "NuevaPass1");
    const submit = screen.getByRole("button", { name: "Actualizar contraseña" });
    fireEvent.click(submit);
    fireEvent.click(submit);
    expect(mockedChangePassword).toHaveBeenCalledTimes(1);
    resolveRequest?.();
    await waitFor(() => expect(screen.getByRole("status")).toBeTruthy());
  });

  it("explains an incorrect current password without exposing backend detail", () => {
    const error = new AxiosError("bad request", "ERR_BAD_REQUEST", undefined, undefined, {
      data: { error: "CURRENT_PASSWORD_INVALID" }, status: 400, statusText: "Bad Request", headers: {}, config: {} as never,
    });
    expect(passwordChangeErrorMessage(error)).toBe("ui.la.contrasena.actual.no.es.correcta");
  });
});
