import api from './api';

export type DocumentType = 'CC' | 'TI' | 'CE';

export interface RegisterData {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  documentType: DocumentType;
  documentNumber: string;
  password: string;
}

export type UserRole = 'USER' | 'OPERATOR' | 'ADMIN';

export interface LoginResponse {
  token: string;
  user: {
    userId: string;
    firstName: string;
    email: string;
    role: UserRole;
  };
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export const authService = {
  register: (data: RegisterData) =>
    api.post('/api/users/register', data),

  login: (
    email: string,
    password: string
  ) =>
    api.post<LoginResponse>('/api/users/login', {
      email,
      password,
    }),

  requestPasswordReset: (email: string) =>
    api.post('/api/auth/forgot-password', { email }),

  resetPassword: (token: string, nuevaContrasena: string) =>
    api.post('/api/auth/reset-password', { token, nuevaContrasena }),

  changePassword: (data: ChangePasswordData) =>
    api.put<void>('/api/users/password', data),
};
