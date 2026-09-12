import api from './api';

export type VehicleType =
  | 'CARRO'
  | 'CAMIONETA'
  | 'MOTO'
  | 'MOTOCARRO'
  | 'FURGONETA'
  | 'PESADO';

export interface Vehicle {
  idVehiculo: string;
  userId: string;
  nombreUsuario: string;
  emailUsuario: string;
  idMarca: string;
  nombreMarca: string;
  marcaAprobada: boolean;
  placa: string;
  color: string | null;
  tipoVehiculo: VehicleType;
  estado: boolean;
  createdAt: string;
}

export interface VehicleRequest {
  placa: string;
  color: string;
  tipoVehiculo: VehicleType;
  fkIdMarca: string;
}

export interface Brand {
  idMarca: string;
  nombre: string;
  estado: boolean;
}

export const vehicleService = {
  getMine: () =>
    api.get<Vehicle[]>('/api/vehiculos/mis-vehiculos'),

  create: (data: VehicleRequest) =>
    api.post<Vehicle>('/api/vehiculos', data),

  update: (id: string, data: VehicleRequest) =>
    api.put<Vehicle>(`/api/vehiculos/${id}`, data),

  changeStatus: (id: string, activo: boolean) =>
    api.patch<Vehicle>(
      `/api/vehiculos/${id}/estado`,
      null,
      {
        params: {
          activo,
        },
      },
    ),

  getActiveBrands: () =>
    api.get<Brand[]>('/api/marcas/activas'),
};