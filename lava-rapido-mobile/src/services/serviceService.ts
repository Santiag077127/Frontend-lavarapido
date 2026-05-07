/** serviceService.ts — RF2, RF3: Catálogo y búsqueda */
import api from './api';

export const serviceService = {
  getAll: () => api.get('/services'),                   // RF2.1
  getById: (id: string) => api.get(`/services/${id}`), // RF2.2
  search: (query: string) =>
    api.get('/services', { params: { q: query } }),     // RF3.1
};
