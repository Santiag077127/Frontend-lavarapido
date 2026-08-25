import { api } from "@/services/api";
import type { Marca, MarcaForm } from "@/features/dashboard/types";

export const getMarcas = async (): Promise<Marca[]> => {
  const response = await api.get<Marca[]>("/marcas"); // ADMIN
  return response.data;
};

export const getMarcasActivas = async (): Promise<Marca[]> => {
  const response = await api.get<Marca[]>("/marcas/activas"); // JWT, cualquier rol
  return response.data;
};

export const getMarcasPendientes = async (): Promise<Marca[]> => {
  const response = await api.get<Marca[]>("/marcas/pendientes"); // ADMIN
  return response.data;
};

export const buscarMarcas = async (nombre: string): Promise<Marca[]> => {
  const response = await api.get<Marca[]>("/marcas/buscar", { params: { nombre } }); // ADMIN
  return response.data;
};

export const getMarcaById = async (id: string): Promise<Marca> => {
  const response = await api.get<Marca>(`/marcas/${id}`);
  return response.data;
};

export const createMarca = async (form: MarcaForm): Promise<Marca> => {
  const response = await api.post<Marca>("/marcas", form); // ADMIN
  return response.data;
};

export const updateMarca = async (id: string, form: MarcaForm): Promise<Marca> => {
  const response = await api.put<Marca>(`/marcas/${id}`, form); // ADMIN
  return response.data;
};

export const cambiarEstadoMarca = async (id: string, activo: boolean): Promise<Marca> => {
  const response = await api.patch<Marca>(`/marcas/${id}/estado`, null, {
    params: { activo },
  }); // ADMIN
  return response.data;
};
