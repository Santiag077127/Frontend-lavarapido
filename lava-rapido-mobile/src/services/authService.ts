/** authService.ts — RF1: Gestión de acceso */
import api from './api';

export const authService = {
  register: (data: { nombre: string; correo: string; telefono: string; contrasena: string }) =>
    api.post('/auth/register', data),                    // RF1.1
  login: (correo: string, contrasena: string) =>
    api.post('/auth/login', { correo, contrasena }),     // RF1.2
  recoverPassword: (correo: string) =>
    api.post('/auth/recover', { correo }),               // RF1.3
  changePassword: (actual: string, nueva: string) =>
    api.put('/auth/password', { actual, nueva }),        // RF1.4
  logout: () =>
    api.post('/auth/logout'),                            // RF1.5
};
