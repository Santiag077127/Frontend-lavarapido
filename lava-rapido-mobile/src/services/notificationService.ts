import api from './api';

export type NotificationItem = {
  id: string;
  tipo: 'booking' | 'payment' | 'status' | 'system';
  titulo: string;
  mensaje: string;
  reservaId: string | null;
  pagoId: string | null;
  leidaAt: string | null;
  createdAt: string;
};

export type NotificationPage = {
  content: NotificationItem[];
  number: number;
  totalPages: number;
  totalElements: number;
};

export const notificationService = {
  list: async (pagina: number, soloNoLeidas = false) =>
    (await api.get<NotificationPage>('/api/notificaciones', { params: { pagina, tamano: 10, soloNoLeidas } })).data,
  count: async () => (await api.get<{ count: number }>('/api/notificaciones/no-leidas/count')).data.count,
  read: async (id: string) => (await api.patch<NotificationItem>(`/api/notificaciones/${id}/leida`)).data,
  readAll: async () => (await api.patch('/api/notificaciones/leidas')).data,
  register: async (instalacionId: string, token: string) =>
    (await api.put('/api/notificaciones/dispositivos', { instalacionId, token })).data,
  deactivate: async (instalacionId: string, authToken: string) =>
    (await api.delete(`/api/notificaciones/dispositivos/${instalacionId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    })).data,
};
