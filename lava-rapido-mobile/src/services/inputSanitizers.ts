/** Shared by human-readable fields only. Passwords must never use these helpers. */
export const sanitizeHumanText = (value: string): string =>
  value.replace(/[^\p{L}\p{M}\s'-]/gu, '');

export const isValidHumanText = (value: string): boolean =>
  /^[\p{L}\p{M}]+(?:[\s'-]+[\p{L}\p{M}]+)*$/u.test(value.trim());
