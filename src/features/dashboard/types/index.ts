export interface Servicio {
  idServicio: string;
  nombre: string;
  descripcion: string;
  precio: number;
  duracionMinutos: number;
  estado: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ServicioForm = Pick<
  Servicio,
  "nombre" | "descripcion" | "precio" | "duracionMinutos"
>;
export type TipoVehiculo = "CARRO" | "MOTO" | "CAMIONETA" | "OTRO"; // ← confirmar valores reales del enum TipoVehiculo.java

export interface Marca {
  idMarca: string; // UUID
  nombre: string;
  estado: boolean;
  idUsuarioSolicitante?: string; // UUID, null si la creó un ADMIN directamente
  emailUsuarioSolicitante?: string;
  createdAt: string;
}

export interface MarcaForm {
  nombre: string;
}

export interface Vehiculo {
  idVehiculo: string; // UUID
  userId: string; // UUID
  nombreUsuario: string;
  emailUsuario: string;
  idMarca: string; // UUID
  nombreMarca: string;
  marcaAprobada: boolean;
  placa: string;
  color?: string;
  tipoVehiculo: TipoVehiculo;
  estado: boolean;
  createdAt: string;
}

export interface VehiculoForm {
  placa: string;
  color?: string;
  tipoVehiculo: TipoVehiculo;
  fkIdMarca: string; // UUID
}

export const AVATAR_OPTIONS = [
  "avatar_1",
  "avatar_2",
  "avatar_3",
  "avatar_4",
  "avatar_5",
] as const;

export type AvatarId = typeof AVATAR_OPTIONS[number];

export interface UserProfile {
  email: string;
  userId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  profilePicture: AvatarId;
}