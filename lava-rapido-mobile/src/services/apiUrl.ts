/** Public build-time configuration. Never put secrets in EXPO_PUBLIC_ variables. */
export function resolveApiUrl(value: string | undefined, isDevelopment: boolean): string {
  if (!value) throw new Error('Configure EXPO_PUBLIC_API_URL para la API móvil.');
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error('EXPO_PUBLIC_API_URL debe ser una URL absoluta.');
  }
  const local = ['localhost', '127.0.0.1', '10.0.2.2'].includes(url.hostname);
  if (url.protocol !== 'https:' && !(isDevelopment && local && url.protocol === 'http:')) {
    throw new Error('EXPO_PUBLIC_API_URL debe usar HTTPS (HTTP local solo en desarrollo).');
  }
  if (url.username || url.password || url.search || url.hash || url.pathname !== '/') {
    throw new Error('EXPO_PUBLIC_API_URL debe contener solo el origen de la API.');
  }
  return url.origin;
}
