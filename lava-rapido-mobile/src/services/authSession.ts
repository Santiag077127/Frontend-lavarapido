import * as SecureStore from 'expo-secure-store';

import type { UserRole } from './authService';

export type AuthSession = {
  token: string;
  role: UserRole;
};

export const AUTH_SESSION_KEY = 'lava-rapido.auth-session';

const USER_ROLES: readonly UserRole[] = ['USER', 'OPERATOR', 'ADMIN'];

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const payload = token.split('.')[1];
  if (!payload) return null;

  try {
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    const binary = globalThis.atob(padded);
    const bytes = Array.from(binary, (character) => `%${character.charCodeAt(0).toString(16).padStart(2, '0')}`);
    return JSON.parse(decodeURIComponent(bytes.join('')));
  } catch {
    return null;
  }
}

export function isSessionTokenValid(token: string, now = Date.now()): boolean {
  const payload = decodeJwtPayload(token);
  const expiration = payload?.exp;

  return typeof expiration === 'number'
    && Number.isFinite(expiration)
    && expiration * 1000 > now;
}

function parseSession(value: string): AuthSession | null {
  try {
    const parsed = JSON.parse(value) as Partial<AuthSession>;
    if (typeof parsed.token !== 'string' || !isSessionTokenValid(parsed.token)) return null;
    if (!USER_ROLES.includes(parsed.role as UserRole)) return null;

    return {
      token: parsed.token,
      role: parsed.role as UserRole,
    };
  } catch {
    return null;
  }
}

export async function saveAuthSession(token: string, role: UserRole): Promise<void> {
  if (!isSessionTokenValid(token)) throw new Error('Cannot persist an invalid authentication token');

  await SecureStore.setItemAsync(AUTH_SESSION_KEY, JSON.stringify({ token, role } satisfies AuthSession));
}

export async function loadAuthSession(): Promise<AuthSession | null> {
  try {
    const stored = await SecureStore.getItemAsync(AUTH_SESSION_KEY);
    if (!stored) return null;

    const session = parseSession(stored);
    if (session) return session;

    await SecureStore.deleteItemAsync(AUTH_SESSION_KEY).catch(() => {});
    return null;
  } catch {
    return null;
  }
}

export async function clearAuthSession(): Promise<void> {
  await SecureStore.deleteItemAsync(AUTH_SESSION_KEY);
}
