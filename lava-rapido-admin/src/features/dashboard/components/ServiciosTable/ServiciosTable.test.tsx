// Prueba el comportamiento de tabla de servicios.
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Servicio } from "@/features/dashboard/types";
import { ServiciosTable } from "./index";

const servicio = (id: string, estado: boolean): Servicio => ({
  idServicio: id,
  nombre: id,
  descripcion: "Lavado",
  precio: 10000,
  duracionMinutos: 30,
  estado,
  createdAt: "2026-01-01",
  updatedAt: "2026-01-01",
});

describe("ServiciosTable", () => {
  it("solo permite activar servicios inactivos y mantiene la edición", () => {
    render(<ServiciosTable servicios={[servicio("Activo", true), servicio("Inactivo", false)]} onEditar={vi.fn()} />);

    expect(screen.queryByRole("button", { name: "Desactivar" })).toBeNull();
    expect(screen.getAllByRole("button", { name: "Editar" })).toHaveLength(2);
    expect(screen.queryByRole("button", { name: "Activar" })).toBeNull();
    expect(screen.queryByRole("columnheader", { name: "Estado" })).toBeNull();
  });
});
