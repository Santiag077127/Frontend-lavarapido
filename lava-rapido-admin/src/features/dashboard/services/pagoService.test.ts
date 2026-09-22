import { beforeEach, describe, expect, it, vi } from "vitest";

const apiMock = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));
vi.mock("@/services/api", () => ({ api: apiMock }));

import { consultarPago, iniciarPago, reconciliarPago } from "./pagoService";

const inicio = (reutilizado: boolean) => ({
  idPago: "pago-1",
  idIntento: "intento-1",
  idReserva: "reserva-1",
  referencia: "PAGO-ABIERTA",
  montoEnCentavos: 3_500_000,
  moneda: "COP",
  publicKey: "pub_test_demo",
  firmaIntegridad: "firma-backend",
  redirectUrl: "http://localhost:5173/pagos/resultado",
  reutilizado,
});

describe("pagoService", () => {
  beforeEach(() => vi.clearAllMocks());

  it.each([
    [201, false],
    [200, true],
  ])("consume el inicio HTTP %s y respeta reutilizado=%s", async (status, reutilizado) => {
    apiMock.post.mockResolvedValueOnce({ status, data: inicio(reutilizado) });
    await expect(iniciarPago("reserva-1")).resolves.toEqual(inicio(reutilizado));
    expect(apiMock.post).toHaveBeenCalledWith("/pagos/reserva/reserva-1");
  });

  it("consulta el pago con intentoActual nullable e historial", async () => {
    const pago = { idPago: "pago-1", idReserva: "reserva-1", metodoPago: "online", monto: 35000, estado: "pendiente", fechaPago: null, intentoActual: null, intentos: [] };
    apiMock.get.mockResolvedValueOnce({ data: pago });
    await expect(consultarPago("reserva-1")).resolves.toEqual(pago);
  });

  it("usa la ruta administrativa documentada", async () => {
    apiMock.post.mockResolvedValueOnce({ data: { estado: "pendiente" } });
    await reconciliarPago("reserva-1");
    expect(apiMock.post).toHaveBeenCalledWith("/pagos/reserva/reserva-1/reconciliar");
  });
});
