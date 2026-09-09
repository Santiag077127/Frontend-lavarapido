import { api } from "@/services/api";

export type EstadoReserva = "PENDIENTE" | "ASIGNADA" | "EN_PROCESO" | "FINALIZADA" | "CANCELADA";

export interface Reserva {
  idReserva: string; idUsuario: string; nombreUsuario: string; idVehiculo: string;
  placaVehiculo: string; tipoVehiculo: string | null; idServicio: string;
  nombreServicio: string; descripcionServicio: string | null; precioServicio: number;
  duracionServicio: number; fechaReserva: string; horaReserva: string;
  fechaHoraInicio: string | null; fechaHoraFin: string | null; estado: EstadoReserva;
  createdAt: string; updatedAt: string;
  idAsignacion?: string | null;
  asignacion?: { idAsignacion?: string } | null;
}

export interface CrearReservaPayload { fkIdVehiculo: string; fkIdServicio: string; fechaReserva: string; horaReserva: string; }

export const crearReserva = async (form: CrearReservaPayload): Promise<Reserva> => (await api.post<Reserva>("/reservas", form)).data;
export const listarReservas = async (): Promise<Reserva[]> => (await api.get<Reserva[]>("/reservas")).data;
export const obtenerReserva = async (id: string): Promise<Reserva> => (await api.get<Reserva>(`/reservas/${id}`)).data;
export const obtenerReservasPorUsuario = async (id: string): Promise<Reserva[]> => (await api.get<Reserva[]>(`/reservas/usuario/${id}`)).data;
export const cambiarEstado = async (id: string, estado: EstadoReserva): Promise<Reserva> => (await api.patch<Reserva>(`/reservas/${id}/estado`, null, { params: { estado } })).data;
export const cancelarReserva = async (id: string): Promise<Reserva> => (await api.patch<Reserva>(`/reservas/${id}/cancelar`)).data;
