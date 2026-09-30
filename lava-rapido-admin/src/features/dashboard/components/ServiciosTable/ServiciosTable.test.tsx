import { fireEvent, render, screen } from "@testing-library/react";
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
    const cambiarEstado = vi.fn();
    render(<ServiciosTable servicios={[servicio("Activo", true), servicio("Inactivo", false)]} onEditar={vi.fn()} onCambiarEstado={cambiarEstado} />);

    expect(screen.queryByRole("button", { name: "common.deactivate" })).toBeNull();
    expect(screen.getAllByRole("button", { name: "common.edit" })).toHaveLength(2);
    fireEvent.click(screen.getByRole("button", { name: "common.activate" }));
    expect(cambiarEstado).toHaveBeenCalledWith(expect.objectContaining({ idServicio: "Inactivo", estado: false }));
  });
});
