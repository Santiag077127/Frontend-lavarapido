import api from '../../../services/api';
import {
  CreateReservationData,
  ReservationResponse,
} from '../types/reservation.types';

export const reservationService = {
  create: async (
    data: CreateReservationData
  ): Promise<ReservationResponse> => {
    const response = await api.post<ReservationResponse>(
      '/api/reservas',
      data
    );

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
};