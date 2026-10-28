const PUBLIC_PASSWORD_RESET_PATHS = new Set([
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
]);

export function shouldAttachAuthorization(url: string | undefined): boolean {
  if (!url) return true;
  const path = url.split(/[?#]/, 1)[0].replace(/\/$/, '');
  return !PUBLIC_PASSWORD_RESET_PATHS.has(path);
}
