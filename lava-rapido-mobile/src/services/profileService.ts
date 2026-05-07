/** profileService.ts — RF9: Perfil */
import api from './api';

export const profileService = {
  update: (data: object) => api.put('/profile', data),         // RF9.1
  updateVehicle: (data: object) => api.put('/profile/vehicle', data), // RF9.2
  updatePhoto: (formData: FormData) =>
    api.put('/profile/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),                                                         // RF9.3
};
