/** paymentService.ts — RF6: Pago */
import api from './api';

export const paymentService = {
  getMethods: () => api.get('/payments/methods'),       // RF6.1
  pay: (orderId: string, method: string) =>
    api.post(`/payments`, { orderId, method }),         // RF6.2
  validate: (transactionId: string) =>
    api.get(`/payments/${transactionId}/validate`),
};
