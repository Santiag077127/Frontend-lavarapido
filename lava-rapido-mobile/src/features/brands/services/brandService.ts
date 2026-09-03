import api from '../../../services/api';
import { Brand } from '../types/brand.types';

export const brandService = {
  getActiveBrands: async (): Promise<Brand[]> => {
    const response = await api.get<Brand[]>(
      '/api/marcas/activas'
    );

    return response.data;
  },
};