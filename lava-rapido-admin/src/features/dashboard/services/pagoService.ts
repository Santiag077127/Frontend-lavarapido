import { api } from "@/services/api";

export type EstadoPago = "pendiente" | "aprobado" | "rechazado";
export type EstadoIntentoPago = EstadoPago | "aprobado_duplicado";

export interface PagoWidgetResponse {
  idPago: string;
  idIntento: string;
  idReserva: string;
  referencia: string;
  montoEnCentavos: number;
  moneda: string;
  publicKey: string;
  firmaIntegridad: string;
  redirectUrl: string;
  reutilizado: boolean;
}

export interface PagoIntento {
  idIntento: string;
  referencia: string;
  wompiTransactionId: string | null;
  wompiPaymentMethodType: string | null;
  wompiStatus: string | null;
  wompiEnvironment: string | null;
  estado: EstadoIntentoPago;
  fechaConfirmacion: string | null;
  createdAt: string;
}

export interface Pago {
  idPago: string;
  idReserva: string;
  metodoPago: string;
  monto: number;
  estado: EstadoPago;
  fechaPago: string | null;
  intentoActual: PagoIntento | null;
  intentos: PagoIntento[];
}

export const iniciarPago = async (idReserva: string): Promise<PagoWidgetResponse> =>
  (await api.post<PagoWidgetResponse>(`/pagos/reserva/${idReserva}`)).data;

export const consultarPago = async (idReserva: string, signal?: AbortSignal): Promise<Pago> =>
  (await api.get<Pago>(`/pagos/reserva/${idReserva}`, { signal })).data;

export const reconciliarPago = async (idReserva: string): Promise<Pago> =>
  (await api.post<Pago>(`/pagos/reserva/${idReserva}/reconciliar`)).data;
