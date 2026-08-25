/** constants.ts — Constantes globales del proyecto */
export const API_BASE_URL = 'https://api.lavarapido.com/v1';
export const WS_BASE_URL  = 'wss://api.lavarapido.com';

export const SERVICE_STATES = {
  PENDING:    'pendiente',
  IN_PROCESS: 'en_proceso',
  COMPLETED:  'completado',
  CANCELLED:  'cancelado',
} as const;

export const SUPPORTED_LANGUAGES = ['es', 'en', 'fr', 'pt'] as const; // RF10.1
export const THEMES = ['default', 'light', 'dark'] as const;           // RF10.2
