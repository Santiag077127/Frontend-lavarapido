/** Public build-time configuration. Never put secrets in EXPO_PUBLIC_ variables. */
export function resolveApiUrl(value: string | undefined, isDevelopment: boolean): string {
  if (!value) throw new Error('Configure EXPO_PUBLIC_API_URL para la API móvil.');
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error('EXPO_PUBLIC_API_URL debe ser una URL absoluta.');
  }
  const octets = url.hostname.split('.').map(Number);
  const privateIPv4 = octets.length === 4 &&
    octets.every((octet) => Number.isInteger(octet) && octet >= 0 && octet <= 255) &&
    (octets[0] === 10 ||
      (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) ||
      (octets[0] === 192 && octets[1] === 168) ||
      octets[0] === 127);
  const local = url.hostname === 'localhost' || privateIPv4;
  if (url.protocol !== 'https:' && !(isDevelopment && local && url.protocol === 'http:')) {
    throw new Error('EXPO_PUBLIC_API_URL debe usar HTTPS (HTTP local solo en desarrollo).');
  }
  if (url.username || url.password || url.search || url.hash || url.pathname !== '/') {
    throw new Error('EXPO_PUBLIC_API_URL debe contener solo el origen de la API.');
  }
  return url.origin;
}
