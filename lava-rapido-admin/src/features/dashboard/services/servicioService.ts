import { api } from "@/services/api";
import type { Servicio, ServicioForm } from "@/features/dashboard/types";

export const getServicios = async (): Promise<Servicio[]> => {
  const response = await api.get<Servicio[]>("/servicios");
  return response.data;
};

export const getServiciosDisponibles = async (): Promise<Servicio[]> => {
  const response = await api.get<Servicio[]>("/servicios/disponibles");
  return response.data;
};

export const buscarServicios = async (nombre: string): Promise<Servicio[]> => {
  const response = await api.get<Servicio[]>("/servicios/buscar", {
    params: { nombre },
  });
  return response.data;
};

export const createServicio = async (form: ServicioForm): Promise<Servicio> => {
  const response = await api.post<Servicio>("/servicios", form);
  return response.data;
};

export const updateServicio = async (
  idServicio: string,
  form: ServicioForm
): Promise<Servicio> => {
  const response = await api.put<Servicio>(`/servicios/${idServicio}`, form);
  return response.data;
};

export const cambiarEstadoServicio = async (
  idServicio: string,
  activo: boolean
): Promise<Servicio> => {
  const response = await api.patch<Servicio>(
    `/servicios/${idServicio}/estado`,
    null,
    { params: { activo } }
  );
  return response.data;
};