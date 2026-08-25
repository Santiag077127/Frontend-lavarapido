/** ratingService.ts — RF5: Calificación */
import api from './api';

export const ratingService = {
  submit: (orderId: string, puntuacion: number, comentario?: string) =>
    api.post('/ratings', { orderId, puntuacion, comentario }), // RF5.1 + RF5.2
};
