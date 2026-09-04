import { api } from "@/services/api";

export interface ConfiguracionWompi {
  moneda: string;
  montoEnCentavos: number;
  referencia: string;
  publicKey: string;
  firmaIntegridad: string;
  redirectUrl: string;
}

export type EstadoPago = "pendiente" | "aprobado" | "rechazado";

export interface Pago {
  idPago: string;
  idReserva: string;
  referenciaPago: string;
  metodoPago: string;
  monto: number;
  estadoWompi: string | null;
  estado: EstadoPago;
  fechaPago: string | null;
}

export const iniciarPago = async (idReserva: string): Promise<ConfiguracionWompi> =>
  (await api.post<ConfiguracionWompi>(`/pagos/reserva/${idReserva}`)).data;

export const consultarPago = async (idReserva: string): Promise<Pago> =>
  (await api.get<Pago>(`/pagos/reserva/${idReserva}`)).data;
