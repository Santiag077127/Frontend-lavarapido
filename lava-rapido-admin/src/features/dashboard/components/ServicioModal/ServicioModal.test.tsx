import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ServicioModal, validateServiceDraft } from "./index";

const validDraft = { nombre: "Lavado premium", precio: "500005.5", duracionMinutos: "30", descripcion: "Lavado completo" };

describe("ServicioModal", () => {
  it("reports required fields and does not submit an empty service", () => {
    const onGuardar = vi.fn();
    render(<ServicioModal servicio={null} onGuardar={onGuardar} onCerrar={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));
    expect(screen.getByText("Completa este campo para continuar.")).toBeInTheDocument();
    expect(screen.getByText("Ingresa un precio válido de al menos 0,01.")).toBeInTheDocument();
    expect(screen.getByText("La duración debe ser un número entero entre 15 y 180 minutos.")).toBeInTheDocument();
    expect(onGuardar).not.toHaveBeenCalled();
  });

  it("accepts a decimal price without changing its amount and removes numeric spinners from price", () => {
    const onGuardar = vi.fn();
    render(<ServicioModal servicio={null} onGuardar={onGuardar} onCerrar={vi.fn()} />);
    const price = screen.getByLabelText("Precio ($)");
    expect(price).toHaveAttribute("type", "text");
    expect(price).toHaveAttribute("inputmode", "decimal");
    fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: validDraft.nombre } });
    fireEvent.change(price, { target: { value: validDraft.precio } });
    fireEvent.change(screen.getByLabelText("Duración (min)"), { target: { value: validDraft.duracionMinutos } });
    fireEvent.change(screen.getByLabelText("Descripción"), { target: { value: validDraft.descripcion } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));
    expect(onGuardar).toHaveBeenCalledWith({ nombre: "Lavado premium", precio: 500005.5, duracionMinutos: 30, descripcion: "Lavado completo" });
  });

  it("validates price, duration and lengths during interaction and on blur", () => {
    expect(validateServiceDraft({ ...validDraft, precio: "1e4" }).precio).toBe("services.validation.priceInvalid");
    expect(validateServiceDraft({ ...validDraft, precio: "-20" }).precio).toBe("services.validation.priceInvalid");
    expect(validateServiceDraft({ ...validDraft, precio: "0.001" }).precio).toBe("services.validation.priceInvalid");
    expect(validateServiceDraft({ ...validDraft, precio: "0.01" }).precio).toBeUndefined();
    expect(validateServiceDraft({ ...validDraft, precio: "0,01" }).precio).toBeUndefined();
    expect(validateServiceDraft({ ...validDraft, precio: "Infinity" }).precio).toBe("services.validation.priceInvalid");
    expect(validateServiceDraft({ ...validDraft, precio: "9007199254740993" }).precio).toBe("services.validation.priceInvalid");
    expect(validateServiceDraft({ ...validDraft, duracionMinutos: "15.5" }).duracionMinutos).toBe("services.validation.durationInvalid");
    expect(validateServiceDraft({ ...validDraft, nombre: "x".repeat(101) }).nombre).toBe("services.validation.nameTooLong");
    expect(validateServiceDraft({ ...validDraft, descripcion: "x".repeat(301) }).descripcion).toBe("services.validation.descriptionTooLong");

    render(<ServicioModal servicio={null} onGuardar={vi.fn()} onCerrar={vi.fn()} />);
    fireEvent.change(screen.getByLabelText("Precio ($)"), { target: { value: "0" } });
    fireEvent.blur(screen.getByLabelText("Precio ($)"));
    expect(screen.getByText("Ingresa un precio válido de al menos 0,01.")).toBeInTheDocument();
  });
});
