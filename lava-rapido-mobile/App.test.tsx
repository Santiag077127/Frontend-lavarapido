import React from 'react';
import { Text } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';

let mockLatestLogoutHandler: (() => void) | null = null;

jest.mock('./src/services/api', () => {
  const actual = jest.requireActual('./src/services/api');
  return {
    ...actual,
    setLogoutHandler: (callback: (() => void) | null) => {
      mockLatestLogoutHandler = callback;
      actual.setLogoutHandler(callback);
    },
  };
});

jest.mock('./src/navigation/AppNavigator', () => {
  const ReactRuntime = require('react');
  const { Text: NativeText } = require('react-native');
  return {
    __esModule: true,
    default: ({
      isLoggedIn,
      setIsLoggedIn,
    }: {
      isLoggedIn: boolean;
      setIsLoggedIn: (value: boolean) => void;
    }) => ReactRuntime.createElement(
      NativeText,
      { onPress: () => setIsLoggedIn(!isLoggedIn) },
      isLoggedIn ? 'Private screens' : 'Login flow',
    ),
  };
});

jest.mock('@react-navigation/native', () => {
  const ReactRuntime = require('react');
  return {
    NavigationContainer: ({ children, onReady }: { children: React.ReactNode; onReady?: () => void }) => {
      ReactRuntime.useEffect(() => onReady?.(), [onReady]);
      return ReactRuntime.createElement(ReactRuntime.Fragment, null, children);
    },
    useNavigationContainerRef: () => ({ isReady: () => true, navigate: jest.fn() }),
  };
});

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('./src/theme/ThemeContext', () => ({
  ThemeContext: require('react').createContext({
    darkMode: false,
    theme: {
      background: '#F7FBFF',
      tabBarBackground: '#FFFFFF',
      primary: '#1565C0',
      text: '#0D1B3E',
      border: '#DDE4EF',
      divider: '#DDE4EF',
      error: '#DC2626',
    },
  }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('./src/components/notifications/NotificationProvider', () => ({
  NotificationProvider: ({ children }: { children: React.ReactNode }) => children,
  appAlert: { alert: jest.fn() },
}));

jest.mock('./src/i18n', () => ({
  __esModule: true,
  initializeLanguage: jest.fn().mockResolvedValue(undefined),
  default: { t: (key: string) => key },
}));

jest.mock('./src/services/userService', () => ({
  userService: { getCurrent: jest.fn() },
}));

jest.mock('./src/services/authSession', () => ({
  loadAuthSession: jest.fn().mockResolvedValue(null),
  clearAuthSession: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('./src/services/pushNotifications', () => ({
  clearLastPushResponse: jest.fn(),
  deactivatePush: jest.fn().mockResolvedValue(undefined),
  registerPush: jest.fn().mockResolvedValue(undefined),
  subscribeToPushResponses: jest.fn(() => jest.fn()),
}));

jest.mock('./src/services/passwordResetLink', () => ({
  extractPasswordResetToken: jest.fn(),
}));

process.env.EXPO_PUBLIC_API_URL ??= 'https://api.example.test';
Object.assign(globalThis, { __DEV__: true });

const App = require('./App').default as typeof import('./App').default;
const { default: api, getToken, setLogoutHandler, setToken } =
  require('./src/services/api') as typeof import('./src/services/api');
const authSession = require('./src/services/authSession') as {
  loadAuthSession: jest.Mock;
  clearAuthSession: jest.Mock;
};
const { userService } = require('./src/services/userService') as {
  userService: { getCurrent: jest.Mock };
};
const { appAlert } = require('./src/components/notifications/NotificationProvider') as {
  appAlert: { alert: jest.Mock };
};

afterEach(() => {
  setToken(null);
  setLogoutHandler(null);
  mockLatestLogoutHandler = null;
  authSession.loadAuthSession.mockReset().mockResolvedValue(null);
  authSession.clearAuthSession.mockReset().mockResolvedValue(undefined);
  userService.getCurrent.mockReset();
});

test('an expired JWT switches the mounted app from private screens to login', async () => {
  let app: TestRenderer.ReactTestRenderer;
  await act(async () => {
    app = TestRenderer.create(React.createElement(App));
    await Promise.resolve();
  });

  expect(app!.root.findByType(Text).props.children).toBe('Login flow');
  await act(async () => {
    app!.root.findByType(Text).props.onPress();
  });
  expect(app!.root.findByType(Text).props.children).toBe('Private screens');
  setToken('expired-session');

  await act(async () => {
    await expect(api.get('/api/users/me', {
      adapter: (config) => Promise.reject({
        isAxiosError: true,
        config,
        response: { status: 401, data: {}, headers: {}, config },
      }),
    })).rejects.toMatchObject({ response: { status: 401 } });
  });

  expect(getToken()).toBeNull();
  expect(app!.root.findByType(Text).props.children).toBe('Login flow');
  expect(appAlert.alert).toHaveBeenCalledWith('profile.sessionExpired', 'profile.loginAgain');
  expect(authSession.clearAuthSession).toHaveBeenCalled();

  await act(async () => app!.unmount());
});

test('restores a valid persisted session only after server validation', async () => {
  authSession.loadAuthSession.mockResolvedValue({ token: 'persisted-session', role: 'OPERATOR' });
  userService.getCurrent.mockResolvedValue({ userId: 'user-id', role: 'OPERATOR' });

  let app: TestRenderer.ReactTestRenderer;
  await act(async () => {
    app = TestRenderer.create(React.createElement(App));
    expect(() => app!.root.findByType(Text)).toThrow();
    await Promise.resolve();
  });

  expect(userService.getCurrent).toHaveBeenCalledTimes(1);
  expect(app!.root.findByType(Text).props.children).toBe('Private screens');
  expect(getToken()).toBe('persisted-session');

  await act(async () => app!.unmount());
});

test('rejects an expired or server-rejected persisted session', async () => {
  authSession.loadAuthSession.mockResolvedValue({ token: 'persisted-session', role: 'USER' });
  userService.getCurrent.mockRejectedValue({ response: { status: 401 } });

  let app: TestRenderer.ReactTestRenderer;
  await act(async () => {
    app = TestRenderer.create(React.createElement(App));
    await Promise.resolve();
  });

  expect(app!.root.findByType(Text).props.children).toBe('Login flow');
  expect(getToken()).toBeNull();
  expect(authSession.clearAuthSession).toHaveBeenCalledTimes(1);

  await act(async () => app!.unmount());
});

test('keeps an unexpired session when identity validation has a temporary network failure', async () => {
  authSession.loadAuthSession.mockResolvedValue({ token: 'persisted-session', role: 'USER' });
  userService.getCurrent.mockRejectedValue({ code: 'ERR_NETWORK' });

  let app: TestRenderer.ReactTestRenderer;
  await act(async () => {
    app = TestRenderer.create(React.createElement(App));
    await Promise.resolve();
  });

  expect(app!.root.findByType(Text).props.children).toBe('Private screens');
  expect(getToken()).toBe('persisted-session');
  expect(authSession.clearAuthSession).not.toHaveBeenCalled();

  await act(async () => app!.unmount());
});

test('clears the persisted session when the user logs out', async () => {
  authSession.loadAuthSession.mockResolvedValue({ token: 'persisted-session', role: 'USER' });
  userService.getCurrent.mockResolvedValue({ userId: 'user-id', role: 'USER' });

  let app: TestRenderer.ReactTestRenderer;
  await act(async () => {
    app = TestRenderer.create(React.createElement(App));
    await Promise.resolve();
  });

  expect(app!.root.findByType(Text).props.children).toBe('Private screens');
  await act(async () => app!.root.findByType(Text).props.onPress());

  expect(app!.root.findByType(Text).props.children).toBe('Login flow');
  expect(getToken()).toBeNull();
  expect(authSession.clearAuthSession).toHaveBeenCalledTimes(1);

  await act(async () => app!.unmount());
});

test('cannot resurrect a session when logout races with restoration', async () => {
  let finishLoad: ((value: { token: string; role: 'USER' }) => void) | undefined;
  authSession.loadAuthSession.mockImplementation(() => new Promise((resolve) => { finishLoad = resolve; }));

  let app: TestRenderer.ReactTestRenderer;
  await act(async () => {
    app = TestRenderer.create(React.createElement(App));
    await Promise.resolve();
  });

  expect(() => app!.root.findByType(Text)).toThrow();
  await act(async () => {
    mockLatestLogoutHandler?.();
    await Promise.resolve();
  });

  await act(async () => {
    finishLoad?.({ token: 'late-session', role: 'USER' });
    await Promise.resolve();
  });

  expect(getToken()).toBeNull();
  expect(app!.root.findByType(Text).props.children).toBe('Login flow');

  await act(async () => app!.unmount());
});
