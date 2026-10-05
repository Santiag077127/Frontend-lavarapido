import api from './api';

export interface RatingResponse {
  idCalificacion: string;
  reservaId: string;
  usuarioId: string;
  puntuacion: number;
  comentario: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRatingRequest {
  reservaId: string;
  puntuacion: number;
  comentario?: string | null;
}

export const ratingService = {
  submit: async (request: CreateRatingRequest): Promise<RatingResponse> => {
    const response = await api.post<RatingResponse>('/api/calificaciones', request);
    return response.data;
  },

  getByReservation: async (reservationId: string): Promise<RatingResponse> => {
    const response = await api.get<RatingResponse>(
      `/api/calificaciones/reserva/${reservationId}`,
    );
    return response.data;
  },
};
