import { afterEach, describe, expect, jest, test } from '@jest/globals';

process.env.EXPO_PUBLIC_API_URL ??= 'https://api.example.test';
Object.assign(globalThis, { __DEV__: true });

const apiModule = require('./api') as typeof import('./api');
const { default: api, getToken, invalidateSession, setLogoutHandler, setToken } = apiModule;

function unauthorizedResponse(config: unknown, status: number) {
  return {
    isAxiosError: true,
    config,
    response: { status, data: {}, headers: {}, config },
  };
}

function requestWithStatus(status: number, path = '/api/users/private') {
  return api.get(path, {
    adapter: (config) => Promise.reject(unauthorizedResponse(config, status)),
  });
}

afterEach(() => {
  setToken(null);
  setLogoutHandler(null);
});

describe('API authentication session handling', () => {
  test('allows up to 60 seconds for a Render cold start without adding retries', () => {
    expect(api.defaults.timeout).toBe(60000);
  });

  test('an authenticated 401 clears the token and invokes app logout', async () => {
    let isLoggedIn = true;
    let visibleScreen = 'Private';
    setToken('expired-session');
    setLogoutHandler(() => {
      isLoggedIn = false;
      visibleScreen = 'Login';
    });

    await expect(requestWithStatus(401)).rejects.toMatchObject({
      response: { status: 401 },
    });

    expect(getToken()).toBeNull();
    expect(isLoggedIn).toBe(false);
    expect(visibleScreen).toBe('Login');
  });

  test('explicit session invalidation uses the global logout handler once', () => {
    const onLogout = jest.fn();
    setToken('updated-identity-session');
    setLogoutHandler(onLogout);

    invalidateSession();
    invalidateSession();

    expect(getToken()).toBeNull();
    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  test('invalid login credentials do not trigger global logout', async () => {
    const onLogout = jest.fn();
    setToken('active-session');
    setLogoutHandler(onLogout);

    await expect(requestWithStatus(401, '/api/users/login')).rejects.toMatchObject({
      response: { status: 401 },
    });

    expect(getToken()).toBe('active-session');
    expect(onLogout).not.toHaveBeenCalled();
  });

  test('a 403 preserves the session', async () => {
    const onLogout = jest.fn();
    setToken('active-session');
    setLogoutHandler(onLogout);

    await expect(requestWithStatus(403)).rejects.toMatchObject({
      response: { status: 403 },
    });

    expect(getToken()).toBe('active-session');
    expect(onLogout).not.toHaveBeenCalled();
  });

  test('simultaneous protected 401 responses trigger logout once', async () => {
    const onLogout = jest.fn();
    setToken('expired-session');
    setLogoutHandler(onLogout);

    const results = await Promise.allSettled([
      requestWithStatus(401, '/api/users/first'),
      requestWithStatus(401, '/api/users/second'),
    ]);

    expect(results.filter((result) => result.status === 'rejected')).toHaveLength(2);
    expect(onLogout).toHaveBeenCalledTimes(1);
    expect(getToken()).toBeNull();
  });

  test('a successful login can install a fresh token after expiration', async () => {
    setToken('expired-session');
    await expect(requestWithStatus(401)).rejects.toMatchObject({
      response: { status: 401 },
    });

    const loginResponse = await api.post('/api/users/login', {}, {
      adapter: (config) => Promise.resolve({
        status: 200,
        statusText: 'OK',
        data: { token: 'new-session', user: { userId: 'user-id', role: 'USER' } },
        headers: {},
        config,
      }),
    });
    setToken(loginResponse.data.token);

    expect(getToken()).toBe('new-session');
  });

  test('a late 401 from an old session cannot clear a new token', async () => {
    const onLogout = jest.fn();
    let rejectOldRequest: (() => void) | undefined;
    let requestStarted: () => void = () => {};
    const adapterStarted = new Promise<void>((resolve) => {
      requestStarted = resolve;
    });
    setToken('old-session');
    setLogoutHandler(onLogout);
    const oldRequest = api.get('/api/users/private', {
      adapter: (config) => new Promise((_, reject) => {
        requestStarted();
        rejectOldRequest = () => reject(unauthorizedResponse(config, 401));
      }),
    });

    await adapterStarted;
    setToken('new-session');
    rejectOldRequest?.();
    await expect(oldRequest).rejects.toMatchObject({
      response: { status: 401 },
    });

    expect(getToken()).toBe('new-session');
    expect(onLogout).not.toHaveBeenCalled();
  });
});
