import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { LoginForm } from "./components/LoginForm/LoginForm";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage/ForgotPasswordPage";

vi.mock("./services/authService", () => ({ login: vi.fn(), forgotPassword: vi.fn() }));

describe("validación de acceso", () => {
  it("muestra errores por campo y habilita el login cuando hay correo válido y contraseña", () => {
    render(<MemoryRouter><LoginForm /></MemoryRouter>);
    const email = screen.getByRole("textbox");
    const password = screen.getByLabelText("auth.password");
    const submit = screen.getByRole("button", { name: "auth.signIn" });

    expect(submit.hasAttribute("disabled")).toBe(true);
    fireEvent.change(email, { target: { value: "correo-invalido" } });
    expect(screen.getByText("Ingresa un correo electrónico válido.")).toBeTruthy();
    fireEvent.change(email, { target: { value: "admin@ejemplo.com" } });
    fireEvent.change(password, { target: { value: "clave existente" } });
    expect(submit.hasAttribute("disabled")).toBe(false);
  });

  it("valida el correo antes de permitir solicitar el restablecimiento", () => {
    render(<MemoryRouter><ForgotPasswordPage /></MemoryRouter>);
    const email = screen.getByRole("textbox");
    const submit = screen.getByRole("button", { name: "auth.sendReset" });

    expect(submit.hasAttribute("disabled")).toBe(true);
    fireEvent.change(email, { target: { value: "sin-arroba" } });
    expect(screen.getByText("Ingresa un correo electrónico válido.")).toBeTruthy();
    fireEvent.change(email, { target: { value: "persona@ejemplo.com" } });
    expect(submit.hasAttribute("disabled")).toBe(false);
  });
});
