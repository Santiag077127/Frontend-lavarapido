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

export const authService = {
  register: (data: RegisterData) =>
    api.post('/api/users/register', data),

  login: (
    email: string,
    password: string
  ) =>
    api.post('/api/users/login', {
      email,
      password,
    }),
};