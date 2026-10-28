import { beforeEach, describe, expect, expectTypeOf, it, vi } from "vitest";
import { api } from "@/services/api";
import type { VehicleType, Vehiculo, VehiculoForm } from "@/features/dashboard/types";
import { createVehiculo, getVehiculos, updateVehiculo } from "./vehiculoService";

vi.mock("@/services/api", () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn() },
}));

const backendVehicleTypes = ["CARRO", "CAMIONETA", "MOTO", "MOTOCARRO", "FURGONETA", "PESADO"] as const;

function makeVehicle(type: VehicleType): Vehiculo {
  return {
    idVehiculo: `vehicle-${type.toLowerCase()}`,
    userId: "user-1",
    nombreUsuario: "Ana Pérez",
    emailUsuario: "ana@example.com",
    idMarca: "brand-1",
    nombreMarca: "Marca",
    marcaAprobada: true,
    placa: type === "MOTO" ? "ABC12D" : "ABC123",
    color: "Negro",
    tipoVehiculo: type,
    estado: true,
    createdAt: "2026-10-25T10:00:00",
  };
}

describe("vehicle type contract", () => {
  it("matches the backend enum exactly and preserves the legacy type alias", () => {
    expectTypeOf<VehicleType>().toEqualTypeOf<
      "CARRO" | "CAMIONETA" | "MOTO" | "MOTOCARRO" | "FURGONETA" | "PESADO"
    >();
    expectTypeOf<VehicleType>().toEqualTypeOf<import("@/features/dashboard/types").TipoVehiculo>();
    expect(backendVehicleTypes).toEqual(["CARRO", "CAMIONETA", "MOTO", "MOTOCARRO", "FURGONETA", "PESADO"]);
  });

  it.each(backendVehicleTypes)("loads existing %s vehicle values unchanged", async (type) => {
    const vehicle = makeVehicle(type);
    vi.mocked(api.get).mockResolvedValueOnce({ data: [vehicle] } as never);

    await expect(getVehiculos()).resolves.toEqual([vehicle]);
    expect(api.get).toHaveBeenCalledExactlyOnceWith("/vehiculos");
  });
});

describe("vehicle API form payloads", () => {
  const form: VehiculoForm = {
    placa: "ABC123",
    color: "Negro",
    tipoVehiculo: "MOTOCARRO",
    fkIdMarca: "brand-1",
  };

  beforeEach(() => vi.clearAllMocks());

  it("creates a vehicle with the unchanged backend request payload", async () => {
    const vehicle = makeVehicle("MOTOCARRO");
    vi.mocked(api.post).mockResolvedValueOnce({ data: vehicle } as never);

    await expect(createVehiculo(form)).resolves.toEqual(vehicle);
    expect(api.post).toHaveBeenCalledExactlyOnceWith("/vehiculos", form);
  });

  it("updates an existing vehicle without changing its identifier or payload", async () => {
    const vehicle = makeVehicle("FURGONETA");
    vi.mocked(api.put).mockResolvedValueOnce({ data: vehicle } as never);

    await expect(updateVehiculo(vehicle.idVehiculo, { ...form, tipoVehiculo: "FURGONETA" })).resolves.toEqual(vehicle);
    expect(api.put).toHaveBeenCalledExactlyOnceWith(`/vehiculos/${vehicle.idVehiculo}`, { ...form, tipoVehiculo: "FURGONETA" });
  });

  it("preserves empty results and propagates HTTP errors from the existing list request", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: [] } as never);
    await expect(getVehiculos()).resolves.toEqual([]);

    const httpError = new Error("request failed");
    vi.mocked(api.get).mockRejectedValueOnce(httpError);
    await expect(getVehiculos()).rejects.toBe(httpError);
    expect(api.get).toHaveBeenCalledTimes(2);
  });
});
