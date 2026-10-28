import axios from 'axios';
import { classifyApiError } from './apiErrors.ts';

export type ReservationCreationError =
  | 'conflict'
  | 'overlap'
  | 'invalid'
  | 'unauthorized'
  | 'forbidden'
  | 'server'
  | 'server_unavailable'
  | 'timeout'
  | 'network'
  | 'unknown';

function backendErrorText(data: unknown): string {
  if (typeof data === 'string') return data.toLowerCase();
  if (!data || typeof data !== 'object') return '';

  const body = data as Record<string, unknown>;
  return ['error', 'message', 'detail']
    .map((key) => typeof body[key] === 'string' ? body[key] as string : '')
    .join(' ')
    .toLowerCase();
}

export function classifyReservationCreationError(
  error: unknown,
): ReservationCreationError {
  if (!axios.isAxiosError(error)) return 'unknown';

  const status = error.response?.status;
  if (status === 409) return 'conflict';
  if (status === 401) return 'unauthorized';
  if (status === 403) return 'forbidden';
  if (status === 400) {
    const backendMessage = backendErrorText(error.response?.data);
    return backendMessage.includes('solap')
      || backendMessage.includes('overlap')
      || backendMessage.includes('horario o estado de reserva invalido')
      || (backendMessage.includes('horario')
        && (backendMessage.includes('vehículo') || backendMessage.includes('vehiculo')))
      ? 'overlap'
      : 'invalid';
  }

  const kind = classifyApiError(error);
  if (kind === 'timeout' || kind === 'network' || kind === 'server' || kind === 'server_unavailable') return kind;
  return 'unknown';
}
