import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider } from "@/theme/theme";
import type { VehicleType, Vehiculo } from "@/features/dashboard/types";
import { getVehiculos } from "@/features/dashboard/services/vehiculoService";
import { VehiculosPage } from "./index";

vi.mock("@/features/dashboard/services/vehiculoService", () => ({ getVehiculos: vi.fn() }));

const backendVehicleTypes: VehicleType[] = ["CARRO", "CAMIONETA", "MOTO", "MOTOCARRO", "FURGONETA", "PESADO"];

function makeVehicle(type: VehicleType, index: number): Vehiculo {
  return {
    idVehiculo: `vehicle-${index}`,
    userId: "user-1",
    nombreUsuario: "Ana Pérez",
    emailUsuario: "ana@example.com",
    idMarca: "brand-1",
    nombreMarca: "Marca",
    marcaAprobada: true,
    placa: `ABC12${index}`,
    tipoVehiculo: type,
    estado: true,
    createdAt: "2026-10-25T10:00:00",
  };
}

function renderPage() {
  return render(<ThemeProvider><VehiculosPage /></ThemeProvider>);
}

describe("VehiculosPage vehicle types", () => {
  beforeEach(() => vi.clearAllMocks());

  it("shows each backend enum value received from the existing list endpoint", async () => {
    vi.mocked(getVehiculos).mockResolvedValue(backendVehicleTypes.map(makeVehicle));
    renderPage();

    for (const type of backendVehicleTypes) {
      expect(await screen.findByRole("cell", { name: type })).toBeTruthy();
    }
    expect(getVehiculos).toHaveBeenCalledExactlyOnceWith();
  });

  it("renders the empty state when the existing list endpoint returns no vehicles", async () => {
    vi.mocked(getVehiculos).mockResolvedValue([]);
    renderPage();

    expect(await screen.findByText("No hay vehículos para mostrar.")).toBeTruthy();
    expect(getVehiculos).toHaveBeenCalledExactlyOnceWith();
  });

  it("shows the existing load error when the list request fails", async () => {
    vi.mocked(getVehiculos).mockRejectedValue(new Error("HTTP 503"));
    const view = renderPage();

    await waitFor(() => expect(view.container.querySelector(".page-error")).toBeTruthy());
    expect(view.container.querySelector(".page-error")?.textContent).toContain("No pudimos cargar");
    expect(getVehiculos).toHaveBeenCalledExactlyOnceWith();
  });
});
