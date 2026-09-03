export type TipoVehiculo =
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
  tipoVehiculo: TipoVehiculo;
  estado: boolean;
  createdAt: string;
}

export interface CreateVehicleData {
  placa: string;
  color?: string;
  tipoVehiculo: TipoVehiculo;
  fkIdMarca: string;
}