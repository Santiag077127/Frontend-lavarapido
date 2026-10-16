import api from '../../../services/api';
import {
  CreateReservationData,
  ReservationResponse,
} from '../types/reservation.types';

export type ReservationCancellationResult = 'CANCELLED' | 'ALREADY_CANCELLED';

export interface ReservationCancellationResponse {
  reservation: ReservationResponse;
  result: ReservationCancellationResult;
}

function isReservationResponse(value: unknown): value is ReservationResponse {
  if (!value || typeof value !== 'object') return false;
  const reservation = value as Record<string, unknown>;
  return typeof reservation.idReserva === 'string'
    && reservation.idReserva.length > 0
    && typeof reservation.fechaReserva === 'string'
    && typeof reservation.horaReserva === 'string'
    && typeof reservation.estado === 'string';
}

export const reservationService = {
  create: async (
    data: CreateReservationData
  ): Promise<ReservationResponse> => {
    const response = await api.post<ReservationResponse>(
      '/api/reservas',
      data
    );

    if (!isReservationResponse(response.data)) {
      throw new Error('Respuesta de reserva inválida');
    }

    return response.data;
  },

  getById: async (
    id: string
  ): Promise<ReservationResponse> => {
    const response = await api.get<ReservationResponse>(
      `/api/reservas/${id}`
    );

    return response.data;
  },

  getByUser: async (
    userId: string
  ): Promise<ReservationResponse[]> => {
    const response = await api.get<ReservationResponse[]>(
      `/api/reservas/usuario/${userId}`
    );

    return response.data;
  },

  cancel: async (
    id: string
  ): Promise<ReservationResponse> => {
    const response = await api.patch<ReservationResponse>(
      `/api/reservas/${id}/cancelar`
    );

    return response.data;
  },

  cancelForCheckout: async (
    id: string
  ): Promise<ReservationCancellationResponse> => {
    const response = await api.patch<ReservationResponse>(
      `/api/reservas/${id}/cancelar`
    );
    const result = response.headers?.['x-reservation-cancellation-result'];
    const reservation = response.data;

    if (
      !isReservationResponse(reservation)
      || reservation.idReserva !== id
      || reservation.estado !== 'CANCELADA'
    ) {
      throw new Error('Respuesta de cancelación de reserva inválida');
    }

    // The response body is authoritative. The header is optional metadata so
    // an older deployed backend can still be upgraded without false failures.
    const normalizedResult = result === 'ALREADY_CANCELLED'
      ? result
      : 'CANCELLED';

    return { reservation, result: normalizedResult };
  },
};
