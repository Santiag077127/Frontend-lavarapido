import { api } from "@/services/api";
import type { Vehiculo, VehiculoForm } from "@/features/dashboard/types";

export const getVehiculos = async (): Promise<Vehiculo[]> => {
  const response = await api.get<Vehiculo[]>("/vehiculos"); // ADMIN — requiere JWT con rol ADMIN
  return response.data;
};

export const getMisVehiculos = async (): Promise<Vehiculo[]> => {
  const response = await api.get<Vehiculo[]>("/vehiculos/mis-vehiculos");
  return response.data;
};

export const getVehiculoById = async (id: string): Promise<Vehiculo> => {
  const response = await api.get<Vehiculo>(`/vehiculos/${id}`);
  return response.data;
};

export const createVehiculo = async (form: VehiculoForm): Promise<Vehiculo> => {
  const response = await api.post<Vehiculo>("/vehiculos", form);
  return response.data;
};

export const updateVehiculo = async (id: string, form: VehiculoForm): Promise<Vehiculo> => {
  const response = await api.put<Vehiculo>(`/vehiculos/${id}`, form);
  return response.data;
};

export const cambiarEstadoVehiculo = async (id: string, activo: boolean): Promise<Vehiculo> => {
  const response = await api.patch<Vehiculo>(`/vehiculos/${id}/estado`, null, {
    params: { activo },
  });
  return response.data;
};