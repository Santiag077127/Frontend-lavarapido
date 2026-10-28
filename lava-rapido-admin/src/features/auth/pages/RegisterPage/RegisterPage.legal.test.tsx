import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { RegisterPage } from "./RegisterPage";

describe("documentos del registro", () => {
  it("abre el texto de privacidad y términos desde los dos consentimientos", () => {
    render(<MemoryRouter><RegisterPage /></MemoryRouter>);
    const [privacyConsent, termsConsent] = screen.getAllByRole("checkbox");

    fireEvent.click(screen.getByRole("button", { name: /política de privacidad/i }));
    expect(screen.getByRole("dialog", { name: "Política de privacidad" })).toHaveTextContent("Datos tratados");
    expect(privacyConsent).not.toBeChecked();
    fireEvent.click(screen.getByRole("button", { name: "Cerrar" }));

    fireEvent.click(screen.getByRole("button", { name: "términos y condiciones" }));
    expect(screen.getByRole("dialog", { name: "Términos y condiciones" })).toHaveTextContent("Reservas y pagos");
    expect(termsConsent).not.toBeChecked();
  });
});
