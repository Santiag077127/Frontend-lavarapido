import api from './api';

export type AssignmentStatus =
  | 'asignada'
  | 'en_proceso'
  | 'completada'
  | 'cancelada';

export interface Assignment {
  idAsignacion: string;
  idReserva: string;
  idOperador: string;
  nombreOperador: string;
  estado: AssignmentStatus;
  fechaAsignacion: string;
}

export const assignmentService = {
  getMine: () => api.get<Assignment[]>('/api/asignaciones/mis-asignaciones'),
  updateStatus: (id: string, estado: AssignmentStatus) =>
    api.patch<Assignment>(`/api/asignaciones/${id}/estado`, { estado }),
};
