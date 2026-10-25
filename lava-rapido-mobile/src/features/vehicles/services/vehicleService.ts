import { vehicleService as sharedVehicleService } from '../../../services/vehicleService';
import type { CreateVehicleData, Vehicle } from '../types/vehicle.types';

export const vehicleService = {
  getMyVehicles: async (): Promise<Vehicle[]> => {
    const response = await sharedVehicleService.getMine();
    return response.data;
  },

  create: async (
    data: CreateVehicleData
  ): Promise<Vehicle> => {
    const response = await sharedVehicleService.create(data);
    return response.data;
  },
};
