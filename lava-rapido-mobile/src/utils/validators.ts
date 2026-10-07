/** validators.ts — Validaciones reutilizables (RNF8: integridad de datos) */
export const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export { isValidPassword } from '../services/passwordPolicy';

export const isValidPhone = (phone: string) =>
  /^\d{10}$/.test(phone.replace(/\s/g, ''));
