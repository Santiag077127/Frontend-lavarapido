import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ThemeProvider } from "@/theme/theme";
import { ServiciosPage } from "./index";

const servicesMock = vi.hoisted(() => ({
  get: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  state: vi.fn(),
}));

vi.mock("@/features/dashboard/services/servicioService", () => ({
  getServicios: servicesMock.get,
  createServicio: servicesMock.create,
  updateServicio: servicesMock.update,
  cambiarEstadoServicio: servicesMock.state,
}));

describe("ServiciosPage", () => {
  it("keeps the modal values and shows the backend conflict message", async () => {
    servicesMock.get.mockResolvedValue([]);
    servicesMock.create.mockRejectedValue({
      isAxiosError: true,
      response: { status: 409, data: { error: "Ya existe un servicio con ese nombre" } },
    });

    render(<ThemeProvider><ServiciosPage /></ThemeProvider>);
    await waitFor(() => expect(servicesMock.get).toHaveBeenCalled());
    fireEvent.click(screen.getByRole("button", { name: /Nuevo servicio/i }));

    fireEvent.change(document.querySelector('input[name="nombre"]')!, { target: { value: "Lavado Premium" } });
    fireEvent.change(document.querySelector('input[name="precio"]')!, { target: { value: "500005" } });
    fireEvent.change(document.querySelector('input[name="duracionMinutos"]')!, { target: { value: "27" } });
    fireEvent.change(document.querySelector('textarea[name="descripcion"]')!, { target: { value: "sasasasasa" } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Ya existe un servicio con ese nombre");
    expect(screen.getByDisplayValue("Lavado Premium")).toBeTruthy();
    expect(screen.getByDisplayValue("500005")).toBeTruthy();
    expect(screen.getByDisplayValue("27")).toBeTruthy();
    expect(screen.getByDisplayValue("sasasasasa")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Guardar" })).toBeTruthy();
  });
});
