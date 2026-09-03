import api from '../../../services/api';
import {
  Vehicle,
  CreateVehicleData,
} from '../types/vehicle.types';

export const vehicleService = {
  getMyVehicles: async (): Promise<Vehicle[]> => {
    const response = await api.get<Vehicle[]>(
      '/api/vehiculos/mis-vehiculos'
    );

    return response.data;
  },

  create: async (
    data: CreateVehicleData
  ): Promise<Vehicle> => {
    const response = await api.post<Vehicle>(
      '/api/vehiculos',
      data
    );

    return response.data;
  },
};