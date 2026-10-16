import axios from 'axios';

export type ApiErrorKind =
  | 'network'
  | 'timeout'
  | 'server_unavailable'
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'bad_request'
  | 'conflict'
  | 'validation'
  | 'server'
  | 'unknown';

export function classifyApiError(error: unknown): ApiErrorKind {
  if (!axios.isAxiosError(error)) return 'unknown';

  if (!error.response) {
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') return 'timeout';
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_CONNECTION_REFUSED') {
      return 'server_unavailable';
    }
    return 'network';
  }

  const status = error.response.status;
  if (status === 401) return 'unauthorized';
  if (status === 403) return 'forbidden';
  if (status === 404) return 'not_found';
  if (status === 400) return 'bad_request';
  if (status === 409) return 'conflict';
  if (status === 422) return 'validation';
  if (status >= 500 && status <= 504) return 'server';
  return 'unknown';
}
