export interface Service {
  idServicio: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  duracionMinutos: number;
  estado: boolean;
  createdAt: string;
  updatedAt: string;
}