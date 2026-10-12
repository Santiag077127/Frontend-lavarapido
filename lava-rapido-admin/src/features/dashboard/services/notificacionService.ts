import { api } from "@/services/api";

export type Notificacion = {
  id: string;
  tipo: "booking" | "payment" | "status" | "system";
  titulo: string;
  mensaje: string;
  reservaId: string | null;
  pagoId: string | null;
  leidaAt: string | null;
  createdAt: string;
};

export type PaginaNotificaciones = {
  content: Notificacion[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export const notificacionesApi = {
  listar: async (pagina: number, soloNoLeidas: boolean) =>
    (await api.get<PaginaNotificaciones>("/notificaciones", { params: { pagina, tamano: 10, soloNoLeidas } })).data,
  contar: async () => (await api.get<{ count: number }>("/notificaciones/no-leidas/count")).data.count,
  leer: async (id: string) => (await api.patch<Notificacion>(`/notificaciones/${id}/leida`)).data,
  leerTodas: async () => (await api.patch<{ actualizadas: number }>("/notificaciones/leidas")).data,
};
