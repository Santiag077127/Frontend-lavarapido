import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGet = vi.hoisted(() => vi.fn());
vi.mock("@/services/api", () => ({ api: { get: mockGet } }));

import { countActiveReservationsForOperator, listarOperadores, type Operador } from "./operadorService";
import type { EstadoReserva, Reserva } from "./reservaService";

const operator: Operador = {
  idOperador: "operator-1", nombre: "Ana", apellidos: "Uno", email: "ana@example.com", estado: true, createdAt: null,
};

const reservation = (idReserva: string, estado: EstadoReserva, operadorNombre: string | null = "Ana Uno"): Reserva => ({
  idReserva, idUsuario: "user-1", nombreUsuario: "Cliente", idVehiculo: "vehicle-1", placaVehiculo: "ABC123",
  tipoVehiculo: "CARRO", idServicio: "service-1", nombreServicio: "Lavado", descripcionServicio: "Lavado general",
  precioServicio: 30000, duracionServicio: 30, fechaReserva: "2099-10-01", horaReserva: "09:00:00",
  fechaHoraInicio: null, fechaHoraFin: null, estado, createdAt: "2099-09-01T09:00:00", updatedAt: "2099-09-01T09:00:00",
  operadorNombre,
});

describe("listarOperadores", () => {
  beforeEach(() => mockGet.mockReset());

  it("uses the operator-only list contract and includes active and inactive operators", async () => {
    mockGet.mockResolvedValue({ data: [
      { idOperador: "active-1", idUsuario: "user-1", firstName: "Ana", lastName: "Uno", emailUsuario: "ana@example.com", estado: true, createdAt: null, updatedAt: null },
      { idOperador: "inactive-1", idUsuario: "user-2", firstName: "Luis", lastName: "Dos", emailUsuario: "luis@example.com", estado: false, createdAt: null, updatedAt: null },
    ] });

    const result = await listarOperadores();

    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(mockGet).toHaveBeenCalledWith("/operadores");
    expect(result).toHaveLength(2);
    expect(result.map(operator => operator.estado)).toEqual([true, false]);
  });
});

describe("countActiveReservationsForOperator", () => {
  it("counts unique pending, assigned, and in-progress reservations and excludes the current reservation", () => {
    expect(countActiveReservationsForOperator("operator-1", [operator], [
      reservation("pending", "PENDIENTE"),
      reservation("pending", "PENDIENTE"),
      reservation("assigned", "ASIGNADA"),
      reservation("in-progress", "EN_PROCESO"),
      reservation("current", "PENDIENTE"),
    ], "current")).toBe(3);
  });

  it("excludes finalized and cancelled reservations", () => {
    expect(countActiveReservationsForOperator("operator-1", [operator], [
      reservation("finished", "FINALIZADA"),
      reservation("cancelled", "CANCELADA"),
    ], "current")).toBe(0);
  });

  it("returns unknown when the operator name cannot uniquely identify the operator", () => {
    const duplicateName = { ...operator, idOperador: "operator-2" };
    expect(countActiveReservationsForOperator("operator-1", [operator, duplicateName], [], "current")).toBeNull();
  });
});
