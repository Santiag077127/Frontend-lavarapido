import { api } from "@/services/api";

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
