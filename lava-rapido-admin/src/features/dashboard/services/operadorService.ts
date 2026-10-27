// Gestiona operadores y asignaciones, adaptando la respuesta del backend a la vista.
import { api } from "@/services/api";
import type { Reserva } from "./reservaService";

export interface Operador {
  idOperador: string;
  nombre: string;
  apellidos: string;
  email: string;
  estado: boolean;
  createdAt: string | null;
}

export interface CrearOperadorPayload { email: string; documentNumber: string; }
export interface Asignacion { idAsignacion: string; idReserva: string; idOperador: string; estado?: string; }
export interface CrearAsignacionPayload { idReserva: string; idOperador: string; }

const ACTIVE_RESERVATION_STATES = new Set(["PENDIENTE", "ASIGNADA", "EN_PROCESO"]);

const normalizeName = (name: string) => name.trim().replace(/\s+/g, " ").toLocaleLowerCase();
const normalizeOperatorName = (operator: Operador) => normalizeName(`${operator.nombre} ${operator.apellidos}`);

/**
 * Counts active reservations only when the API's operator name maps to one
 * unique operator. A null result means the existing response is insufficient
 * to identify this operator safely.
 */
export const countActiveReservationsForOperator = (
  operatorId: string,
  operators: Operador[],
  reservations: Reserva[],
  excludedReservationId: string,
): number | null => {
  const operator = operators.find((item) => item.idOperador === operatorId);
  if (!operator || !operator.estado) return null;

  const operatorName = normalizeOperatorName(operator);
  if (!operatorName) return null;

  const matchingOperators = operators.filter((item) => normalizeOperatorName(item) === operatorName);
  if (matchingOperators.length !== 1) return null;

  const activeReservationIds = new Set(
    reservations
      .filter((reservation) =>
        reservation.idReserva !== excludedReservationId
        && ACTIVE_RESERVATION_STATES.has(reservation.estado)
        && normalizeName(reservation.operadorNombre ?? "") === operatorName,
      )
      .map((reservation) => reservation.idReserva),
  );

  return activeReservationIds.size;
};

type OperadorResponse = {
  idOperador: string;
  idUsuario: string;
  firstName: string;
  lastName: string;
  emailUsuario: string;
  estado: boolean;
  createdAt: string | null;
  updatedAt: string | null;
};

const normalizarOperador = (data: OperadorResponse): Operador => ({
  idOperador: data.idOperador,
  nombre: data.firstName,
  apellidos: data.lastName,
  email: data.emailUsuario,
  estado: data.estado,
  createdAt: data.createdAt,
});

export const listarOperadores = async (): Promise<Operador[]> =>
  (await api.get<OperadorResponse[]>("/operadores")).data.map(normalizarOperador);

export const crearOperador = async (payload: CrearOperadorPayload): Promise<Operador> =>
  normalizarOperador((await api.post<OperadorResponse>("/operadores", payload)).data);

export const cambiarEstadoOperador = async (idOperador: string, estado: boolean): Promise<Operador> =>
  normalizarOperador((await api.patch<OperadorResponse>(`/operadores/${idOperador}/estado`, { estado })).data);

export const desactivarTodosOperadores = async (): Promise<void> => {
  await api.patch("/operadores/desactivar-todos");
};

export const crearAsignacion = async (payload: CrearAsignacionPayload): Promise<Asignacion> =>
  (await api.post<Asignacion>("/asignaciones", payload)).data;
