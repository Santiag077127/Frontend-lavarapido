export const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export { isValidPassword } from './passwordPolicy';

export const isValidPhone = (phone: string) =>
  /^\d{10}$/.test(phone.replace(/\s/g, ''));
