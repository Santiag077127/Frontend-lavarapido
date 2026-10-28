import { api } from "@/services/api";

export interface ServiceRating {
  idCalificacion: string;
  reservaId: string;
  usuarioId: string;
  puntuacion: number;
  comentario: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export const getRatingForReservation = async (reservationId: string): Promise<ServiceRating> => {
  const response = await api.get<ServiceRating>(`/calificaciones/reserva/${reservationId}`);
  return response.data;
};
