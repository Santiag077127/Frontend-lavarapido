/** validators.ts — Validaciones reutilizables (RNF8: integridad de datos) */
export const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const isValidPassword = (password: string) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password); // RF1.4: mín 8 chars, mayús, minús, número

export const isValidPhone = (phone: string) =>
  /^\d{10}$/.test(phone.replace(/\s/g, ''));
