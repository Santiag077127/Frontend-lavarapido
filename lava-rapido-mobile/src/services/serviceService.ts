/** serviceService.ts — Catálogo de servicios */

import api from './api';
import { Service } from '../features/services/types/service.types';

export const serviceService = {
  /**
   * Obtener todos los servicios.
   * GET /api/servicios
   */
  getAll: async (): Promise<Service[]> => {
    const response = await api.get<Service[]>('/api/servicios');

    return response.data;
  },

  /**
   * Obtener servicios disponibles.
   * GET /api/servicios/disponibles
   */
  getAvailable: async (): Promise<Service[]> => {
    const response = await api.get<Service[]>(
      '/api/servicios/disponibles'
    );

    return response.data;
  },

  /**
   * Buscar servicios por nombre.
   * GET /api/servicios/buscar?nombre=...
   */
  search: async (nombre: string): Promise<Service[]> => {
    const response = await api.get<Service[]>(
      '/api/servicios/buscar',
      {
        params: {
          nombre,
        },
      }
    );

    return response.data;
  },

  /**
   * Obtener un servicio por ID.
   * GET /api/servicios/{id}
   */
  getById: async (id: string): Promise<Service> => {
    const response = await api.get<Service>(
      `/api/servicios/${id}`
    );

    return response.data;
  },
};