import api from './api';

export type PaymentStatus = 'pendiente' | 'aprobado' | 'rechazado';
export type PaymentAttemptStatus = PaymentStatus | 'aprobado_duplicado';

export interface WompiCheckoutData {
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

export interface PaymentAttempt {
  idIntento: string;
  referencia: string;
  wompiTransactionId: string | null;
  wompiPaymentMethodType: string | null;
  wompiStatus: string | null;
  wompiEnvironment: string;
  estado: PaymentAttemptStatus;
  fechaConfirmacion: string | null;
  createdAt: string;
}

export interface ReservationPayment {
  idPago: string;
  idReserva: string;
  metodoPago: string;
  monto: number;
  estado: PaymentStatus;
  fechaPago: string | null;
  intentoActual: PaymentAttempt | null;
  intentos: PaymentAttempt[];
}

export const paymentService = {
  start: async (reservationId: string): Promise<WompiCheckoutData> => {
    const response = await api.post<WompiCheckoutData>(
      `/api/pagos/reserva/${reservationId}`,
    );
    const data = response.data as WompiCheckoutData | null;
    const record = (data ?? {}) as unknown as Record<string, unknown>;

    const requiredFields: Array<keyof WompiCheckoutData> = [
      'idPago',
      'idIntento',
      'idReserva',
      'referencia',
      'montoEnCentavos',
      'moneda',
      'publicKey',
      'firmaIntegridad',
      'redirectUrl',
      'reutilizado',
    ];
    const missingFields = requiredFields.filter(
      (key) => record[key] === undefined || record[key] === null,
    );
    if (missingFields.length > 0) {
      throw new Error('Respuesta de inicio de pago incompleta');
    }

    return response.data;
  },

  getByReservation: async (reservationId: string): Promise<ReservationPayment> => {
    const response = await api.get<ReservationPayment>(
      `/api/pagos/reserva/${reservationId}`,
    );
    return response.data;
  },

  verify: async (reservationId: string, referencia: string, transactionId: string): Promise<ReservationPayment> => {
    const response = await api.post<ReservationPayment>(
      `/api/pagos/reserva/${reservationId}/verificar`,
      { referencia, transactionId },
    );
    return response.data;
  },
};
