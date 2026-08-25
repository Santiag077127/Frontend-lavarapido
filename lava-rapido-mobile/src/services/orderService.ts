/** orderService.ts — RF2 (solicitud), RF6, RF7 */
import api from './api';

export const orderService = {
  create: (servicioId: string) =>
    api.post('/orders', { servicioId }),                // Solicitar servicio
  getById: (id: string) => api.get(`/orders/${id}`),
  getHistory: () => api.get('/orders/history'),
  getReceipt: (orderId: string) =>
    api.get(`/orders/${orderId}/receipt`),              // RF7
};
