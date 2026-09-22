import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/store/authStore";
import type { Pago, PagoIntento, PagoWidgetResponse } from "../../services/pagoService";

const pagosMock = vi.hoisted(() => ({ consultar: vi.fn(), iniciar: vi.fn(), reconciliar: vi.fn() }));
const widgetMock = vi.hoisted(() => ({ reservar: vi.fn(() => true), liberar: vi.fn() }));

vi.mock("../../services/pagoService", () => ({
  consultarPago: pagosMock.consultar,
  iniciarPago: pagosMock.iniciar,
  reconciliarPago: pagosMock.reconciliar,
}));

vi.mock("../../hooks/useWompiWidget", () => ({
  useWompiWidget: () => ({ listo: true, cargando: false, error: false, reintentar: vi.fn() }),
  crearConfiguracionWidget: (pago: PagoWidgetResponse) => ({
    currency: pago.moneda,
    amountInCents: pago.montoEnCentavos,
    reference: pago.referencia,
    publicKey: pago.publicKey,
    signature: { integrity: pago.firmaIntegridad },
    redirectUrl: pago.redirectUrl,
  }),
  reservarFlujoWompi: widgetMock.reservar,
  liberarFlujoWompi: widgetMock.liberar,
}));

import { CobrarReservaButton } from "./CobrarReservaButton";
import { guardarContextoPago } from "../../services/pagoContext";
import { PagoResultadoPage } from "../../pages/PagoResultadoPage/PagoResultadoPage";

const intento = (overrides: Partial<PagoIntento> = {}): PagoIntento => ({
  idIntento: "intento-1",
  referencia: "PAGO-1",
  wompiTransactionId: null,
  wompiPaymentMethodType: null,
  wompiStatus: null,
  wompiEnvironment: "test",
  estado: "pendiente",
  fechaConfirmacion: null,
  createdAt: "2026-09-21T14:32:10",
  ...overrides,
});

const pago = (overrides: Partial<Pago> = {}): Pago => {
  const actual = intento();
  return {
    idPago: "pago-1",
    idReserva: "reserva-1",
    metodoPago: "online",
    monto: 35000,
    estado: "pendiente",
    fechaPago: null,
    intentoActual: actual,
    intentos: [actual],
    ...overrides,
  };
};

const inicio: PagoWidgetResponse = {
  idPago: "pago-1",
  idIntento: "intento-1",
  idReserva: "reserva-1",
  referencia: "PAGO-1",
  montoEnCentavos: 3500000,
  moneda: "COP",
  publicKey: "pub_test",
  firmaIntegridad: "firma",
  redirectUrl: "http://localhost:5173/pagos/resultado",
  reutilizado: true,
};

let callbackWidget: ((result: { transaction?: { id?: string } }) => void) | undefined;

describe("CobrarReservaButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    callbackWidget = undefined;
    window.WidgetCheckout = class {
      open(callback: (result: { transaction?: { id?: string } }) => void) { callbackWidget = callback; }
    } as typeof window.WidgetCheckout;
    pagosMock.iniciar.mockResolvedValue(inicio);
    pagosMock.reconciliar.mockResolvedValue(pago());
    useAuthStore.setState({ token: "jwt", user: { userId: "admin-1", firstName: "Ada", email: "ada@example.com", role: "ADMIN" } });
  });

  afterEach(() => {
    vi.useRealTimers();
    delete window.WidgetCheckout;
  });

  it("no aprueba con el callback del Widget: espera la respuesta del backend", async () => {
    pagosMock.consultar.mockResolvedValue(pago());
    const onAprobado = vi.fn();
    render(<CobrarReservaButton idReserva="reserva-1" habilitado estadoReserva="PENDIENTE" onPagoAprobado={onAprobado} onError={vi.fn()} />);
    await userEvent.click(await screen.findByRole("button", { name: "Continuar en Wompi" }));
    expect(pagosMock.iniciar).toHaveBeenCalledTimes(1);
    act(() => callbackWidget?.({ transaction: { id: "tx-no-confiable" } }));
    await waitFor(() => expect(pagosMock.consultar).toHaveBeenCalledTimes(2));
    expect(onAprobado).not.toHaveBeenCalled();
  });

  it("previene el doble envío mientras inicia el Widget", async () => {
    pagosMock.consultar.mockResolvedValue(pago({ estado: "rechazado", intentoActual: intento({ estado: "rechazado" }), intentos: [intento({ estado: "rechazado" })] }));
    let resolver!: (value: PagoWidgetResponse) => void;
    pagosMock.iniciar.mockReturnValue(new Promise((resolve) => { resolver = resolve; }));
    render(<CobrarReservaButton idReserva="reserva-1" habilitado onPagoAprobado={vi.fn()} onError={vi.fn()} />);
    const boton = await screen.findByRole("button", { name: "Reintentar pago" });
    fireEvent.click(boton);
    fireEvent.click(boton);
    expect(pagosMock.iniciar).toHaveBeenCalledTimes(1);
    await act(async () => resolver(inicio));
  });

  it("permite reintentar un pago rechazado mediante el POST existente", async () => {
    pagosMock.consultar.mockResolvedValue(pago({ estado: "rechazado", intentoActual: intento({ estado: "rechazado" }), intentos: [intento({ estado: "rechazado" })] }));
    render(<CobrarReservaButton idReserva="reserva-1" habilitado onPagoAprobado={vi.fn()} onError={vi.fn()} />);
    await userEvent.click(await screen.findByRole("button", { name: "Reintentar pago" }));
    expect(pagosMock.iniciar).toHaveBeenCalledWith("reserva-1");
  });

  it("muestra el método abierto, los campos nuevos y la incidencia de aprobado duplicado", async () => {
    const aprobado = intento({ estado: "aprobado", wompiPaymentMethodType: "CARD", wompiTransactionId: "tx-1", fechaConfirmacion: "2026-09-21T14:35:20" });
    const duplicado = intento({ idIntento: "intento-2", referencia: "PAGO-2", estado: "aprobado_duplicado", wompiPaymentMethodType: "QR_NUEVO", wompiTransactionId: "tx-2" });
    pagosMock.consultar.mockResolvedValue(pago({ estado: "aprobado", fechaPago: "2026-09-21T14:35:20", intentoActual: aprobado, intentos: [aprobado, duplicado] }));
    render(<CobrarReservaButton idReserva="reserva-1" habilitado estadoReserva="CANCELADA" onPagoAprobado={vi.fn()} onError={vi.fn()} />);
    expect(await screen.findByText("Tarjeta")).toBeInTheDocument();
    expect(screen.getByText(/Posible doble cobro detectado/)).toBeInTheDocument();
    expect(screen.getByText(/continúa cancelada/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /pagar|reintentar/i })).not.toBeInTheDocument();
  });

  it("solo ofrece reconciliación al ADMIN cuando el pendiente tiene transaction ID", async () => {
    const pendiente = intento({ wompiTransactionId: "tx-1", wompiPaymentMethodType: "PSE" });
    pagosMock.consultar.mockResolvedValue(pago({ intentoActual: pendiente, intentos: [pendiente] }));
    const vista = render(<CobrarReservaButton idReserva="reserva-1" habilitado onPagoAprobado={vi.fn()} onError={vi.fn()} />);
    const boton = await screen.findByRole("button", { name: "Verificar con Wompi" });
    await userEvent.click(boton);
    expect(pagosMock.reconciliar).toHaveBeenCalledWith("reserva-1");
    expect(pagosMock.consultar).toHaveBeenCalledTimes(2);
    vista.unmount();

    useAuthStore.setState({ token: "jwt", user: { userId: "user-1", firstName: "Lina", email: "lina@example.com", role: "USER" } });
    pagosMock.consultar.mockClear();
    render(<CobrarReservaButton idReserva="reserva-1" habilitado onPagoAprobado={vi.fn()} onError={vi.fn()} />);
    await screen.findByText("PSE");
    expect(screen.queryByRole("button", { name: "Verificar con Wompi" })).not.toBeInTheDocument();
  });

  it("limpia el polling al desmontarse", async () => {
    pagosMock.consultar.mockResolvedValue(pago());
    const vista = render(<CobrarReservaButton idReserva="reserva-1" habilitado onPagoAprobado={vi.fn()} onError={vi.fn()} />);
    await userEvent.click(await screen.findByRole("button", { name: "Continuar en Wompi" }));
    act(() => callbackWidget?.({}));
    await waitFor(() => expect(pagosMock.consultar).toHaveBeenCalledTimes(2));
    vi.useFakeTimers();
    vista.unmount();
    const llamadas = pagosMock.consultar.mock.calls.length;
    await vi.advanceTimersByTimeAsync(12_000);
    expect(pagosMock.consultar).toHaveBeenCalledTimes(llamadas);
  });

  it("al agotar la espera conserva el estado pendiente", async () => {
    pagosMock.consultar.mockResolvedValue(pago());
    render(<CobrarReservaButton idReserva="reserva-1" habilitado onPagoAprobado={vi.fn()} onError={vi.fn()} />);
    await userEvent.click(await screen.findByRole("button", { name: "Continuar en Wompi" }));
    vi.useFakeTimers();
    act(() => callbackWidget?.({}));
    await act(async () => { await vi.advanceTimersByTimeAsync(124_000); });
    expect(screen.getByText(/Pago pendiente de confirmación/)).toBeInTheDocument();
    expect(screen.queryByText("Rechazado")).not.toBeInTheDocument();
  });

  it("el redirect usa el contexto guardado y no confunde el transaction ID con la reserva", async () => {
    guardarContextoPago({ idReserva: "reserva-contexto", referencia: "PAGO-CONTEXTO" });
    pagosMock.consultar.mockResolvedValue(pago({ idReserva: "reserva-contexto" }));
    render(<MemoryRouter initialEntries={["/pagos/resultado?id=tx-wompi"]}><PagoResultadoPage /></MemoryRouter>);
    expect(await screen.findByText(/La confirmación que ves aquí proviene del backend/)).toBeInTheDocument();
    await waitFor(() => expect(pagosMock.consultar).toHaveBeenCalledWith("reserva-contexto", expect.any(AbortSignal)));
    expect(pagosMock.consultar).not.toHaveBeenCalledWith("tx-wompi", expect.anything());
  });
});
