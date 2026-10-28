const EMAIL_PATTERN = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;

export const normalizeEmail = (email: string) => email.trim();

export const isValidEmail = (email: string) =>
  EMAIL_PATTERN.test(normalizeEmail(email));

export { isValidPassword } from './passwordPolicy.ts';

export const isValidPhone = (phone: string) =>
  /^\d{10}$/.test(phone.replace(/\s/g, ''));
