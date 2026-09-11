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
};
