
import api from './api';

// =========================================================
// ESTADOS DE LA ASIGNACIÓN
// Deben coincidir con el enum del backend
// =========================================================

export type AssignmentStatus =
  | 'asignada'
  | 'en_proceso'
  | 'completada'
  | 'cancelada';

// =========================================================
// INTERFAZ DE ASIGNACIÓN
// =========================================================

export interface Assignment {
  // -------------------------------------------------------
  // ASIGNACIÓN
  // -------------------------------------------------------

  idAsignacion: string;
  idReserva: string;
  idOperador: string;
  nombreOperador: string;
  estado: AssignmentStatus;
  fechaAsignacion: string;

  // -------------------------------------------------------
  // CLIENTE
  // -------------------------------------------------------

  nombreCliente: string;

  // -------------------------------------------------------
  // VEHÍCULO
  // -------------------------------------------------------

  placa: string;
  color: string;
  tipoVehiculo: string;

  // -------------------------------------------------------
  // SERVICIO
  // -------------------------------------------------------

  idServicio: string;
  nombreServicio: string;
  descripcionServicio: string;
  precioServicio: number;
  duracionMinutos: number;

  // -------------------------------------------------------
  // RESERVA
  // -------------------------------------------------------

  fechaReserva: string;
  horaReserva: string;

  // -------------------------------------------------------
  // AUDITORÍA
  // -------------------------------------------------------

  createdAt: string;
  updatedAt: string;
}

// =========================================================
// SERVICIO DE ASIGNACIONES
// =========================================================

export const assignmentService = {

  // -------------------------------------------------------
  // OBTENER ASIGNACIONES DEL OPERADOR AUTENTICADO
  // -------------------------------------------------------

  getMine: () =>
    api.get<Assignment[]>(
      '/api/asignaciones/mis-asignaciones'
    ),

  // -------------------------------------------------------
  // ACTUALIZAR ESTADO DE UNA ASIGNACIÓN
  // -------------------------------------------------------

  updateStatus: (
    id: string,
    estado: AssignmentStatus
  ) =>
    api.patch<Assignment>(
      `/api/asignaciones/${id}/estado`,
      { estado }
    ),
};
