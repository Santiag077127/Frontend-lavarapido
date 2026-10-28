import { afterEach, describe, expect, jest, test } from '@jest/globals';

import * as SecureStore from 'expo-secure-store';

import {
  AUTH_SESSION_KEY,
  clearAuthSession,
  isSessionTokenValid,
  loadAuthSession,
  saveAuthSession,
} from './authSession';

const secureStore = SecureStore as jest.Mocked<typeof SecureStore>;

function createJwt(expiration: number) {
  const payload = Buffer.from(JSON.stringify({ exp: expiration })).toString('base64url');
  return `header.${payload}.signature`;
}

const validToken = createJwt(2_000_000_000);

afterEach(() => {
  jest.clearAllMocks();
});

describe('secure authentication session storage', () => {
  test('validates JWT expiration without logging or persisting passwords', () => {
    expect(isSessionTokenValid(validToken, 1_000_000_000_000)).toBe(true);
    expect(isSessionTokenValid(createJwt(1), 1_000_000_000_000)).toBe(false);
  });

  test('stores only the token and role in secure storage', async () => {
    secureStore.setItemAsync.mockResolvedValue(undefined);

    await saveAuthSession(validToken, 'USER');

    expect(secureStore.setItemAsync).toHaveBeenCalledWith(
      AUTH_SESSION_KEY,
      JSON.stringify({ token: validToken, role: 'USER' }),
    );
  });

  test('restores a valid stored session', async () => {
    secureStore.getItemAsync.mockResolvedValue(JSON.stringify({ token: validToken, role: 'OPERATOR' }));

    await expect(loadAuthSession()).resolves.toEqual({ token: validToken, role: 'OPERATOR' });
  });

  test('removes expired or corrupted sessions', async () => {
    secureStore.getItemAsync.mockResolvedValueOnce(JSON.stringify({ token: createJwt(1), role: 'USER' }));
    secureStore.deleteItemAsync.mockResolvedValue(undefined);

    await expect(loadAuthSession()).resolves.toBeNull();
    expect(secureStore.deleteItemAsync).toHaveBeenCalledWith(AUTH_SESSION_KEY);

    secureStore.getItemAsync.mockResolvedValueOnce('{invalid');
    await expect(loadAuthSession()).resolves.toBeNull();
    expect(secureStore.deleteItemAsync).toHaveBeenCalledTimes(2);
  });

  test('fails safely when secure storage cannot be read or written', async () => {
    secureStore.getItemAsync.mockRejectedValue(new Error('storage unavailable'));
    await expect(loadAuthSession()).resolves.toBeNull();

    secureStore.setItemAsync.mockRejectedValue(new Error('storage unavailable'));
    await expect(saveAuthSession(validToken, 'USER')).rejects.toThrow('storage unavailable');
  });

  test('propagates secure deletion failures so logout can handle them', async () => {
    secureStore.deleteItemAsync.mockRejectedValue(new Error('storage unavailable'));

    await expect(clearAuthSession()).rejects.toThrow('storage unavailable');
  });
});
