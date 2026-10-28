export type ReservationStatus =
  | 'PENDIENTE'
  | 'ASIGNADA'
  | 'EN_PROCESO'
  | 'FINALIZADA'
  | 'CANCELADA';

export interface CreateReservationData {
  fkIdVehiculo: string;
  fkIdServicio: string;
  fechaReserva: string;
  horaReserva: string;
}

export interface ReservationResponse {
  idReserva: string;
  idUsuario: string;
  idVehiculo: string;
  idServicio: string;
  nombreUsuario: string;
  placaVehiculo: string;
  tipoVehiculo: string;
  nombreServicio: string | null;
  descripcionServicio: string | null;
  precioServicio: number;
  duracionServicio: number;
  fechaReserva: string;
  horaReserva: string;
  fechaHoraInicio: string | null;
  fechaHoraFin: string | null;
  createdAt: string;
  updatedAt: string;
  estado: ReservationStatus;
}