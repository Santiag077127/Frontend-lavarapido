import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Marca } from "@/features/dashboard/types";

const marcasMock = vi.hoisted(() => ({ listar: vi.fn(), crear: vi.fn() }));
vi.mock("@/features/dashboard/services/marcaService", () => ({
  getMarcas: marcasMock.listar,
  createMarca: marcasMock.crear,
}));

import { MarcasPage } from "./index";

const marca: Marca = {
  idMarca: "marca-1", nombre: "TOYOTA", estado: true, createdAt: "2026-01-01",
};

describe("MarcasPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    marcasMock.listar.mockResolvedValue([marca]);
    marcasMock.crear.mockResolvedValue(marca);
  });

  it("permite crear una marca sin mostrar una columna de acciones", async () => {
    render(<MarcasPage />);
    expect(await screen.findByText("TOYOTA")).toBeTruthy();
    expect(screen.queryByRole("columnheader", { name: "common.actions" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /Nueva marca/i }));
    fireEvent.change(screen.getByLabelText("Nombre de la marca"), { target: { value: "Mazda" } });
    fireEvent.click(screen.getByRole("button", { name: "Crear marca" }));

    await waitFor(() => expect(marcasMock.crear).toHaveBeenCalledWith({ nombre: "Mazda" }));
    expect(await screen.findByText("Marca creada correctamente.")).toBeTruthy();
  });

  it("filtra nombres repetidos y caracteres no admitidos antes de guardar", async () => {
    render(<MarcasPage />);
    await screen.findByText("TOYOTA");
    fireEvent.click(screen.getByRole("button", { name: /Nueva marca/i }));
    const input = screen.getByLabelText("Nombre de la marca");

    fireEvent.blur(input);
    expect(screen.getByText("Escribe un nombre de marca.")).toBeTruthy();

    fireEvent.change(input, { target: { value: " Tóyota " } });
    expect(screen.getByText("Ya existe una marca con ese nombre.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Crear marca" }).hasAttribute("disabled")).toBe(true);

    fireEvent.change(input, { target: { value: "Marca/No válida" } });
    expect(screen.getByText(/Usa letras, números/)).toBeTruthy();
    expect(marcasMock.crear).not.toHaveBeenCalled();
  });
});
