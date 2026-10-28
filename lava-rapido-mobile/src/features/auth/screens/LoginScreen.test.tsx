import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

import LoginScreen from './LoginScreen';

const mockLogin = jest.fn();
const mockSaveAuthSession = jest.fn();
const mockSetToken = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn() }),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('../../../theme/ThemeContext', () => ({
  ThemeContext: require('react').createContext({
    darkMode: false,
    theme: {
      background: '#fff', text: '#111', textSecondary: '#666', border: '#ddd',
      inputBackground: '#fafafa', primary: '#06c', primaryDark: '#05a',
      onPrimary: '#fff', errorBackground: '#fee', errorBorder: '#f00', errorText: '#a00',
    },
  }),
}));

jest.mock('../../../assets/images', () => ({
  images: { logo: 1 },
}));

jest.mock('../../../services/authService', () => ({
  authService: { login: (...args: unknown[]) => mockLogin(...args) },
}));

jest.mock('../../../services/api', () => ({
  classifyApiError: () => 'unknown',
  setToken: (...args: unknown[]) => mockSetToken(...args),
}));

jest.mock('../../../services/authSession', () => ({
  saveAuthSession: (...args: unknown[]) => mockSaveAuthSession(...args),
}));

jest.mock('../../../services/validators', () => ({
  isValidEmail: () => true,
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockLogin.mockResolvedValue({
    data: {
      token: 'session-token',
      user: { userId: 'user-id', role: 'USER' },
    },
  });
  mockSaveAuthSession.mockResolvedValue(undefined);
});

test('persists the session before completing a successful login', async () => {
  const setIsLoggedIn = jest.fn();
  const setRole = jest.fn();
  const view = render(<LoginScreen setIsLoggedIn={setIsLoggedIn} setRole={setRole} />);

  fireEvent.changeText(view.getByLabelText('login.email'), 'user@example.com');
  fireEvent.changeText(view.getByLabelText('login.password'), 'correct-password');
  fireEvent.press(view.getByRole('button', { name: 'login.button' }));

  await waitFor(() => expect(mockSaveAuthSession).toHaveBeenCalledWith('session-token', 'USER'));
  expect(mockSetToken).toHaveBeenCalledWith('session-token');
  expect(setRole).toHaveBeenCalledWith('USER');
  expect(setIsLoggedIn).toHaveBeenCalledWith(true);
});

test('does not activate memory authentication when secure persistence fails', async () => {
  mockSaveAuthSession.mockRejectedValue(new Error('storage unavailable'));
  const setIsLoggedIn = jest.fn();
  const view = render(<LoginScreen setIsLoggedIn={setIsLoggedIn} />);

  fireEvent.changeText(view.getByLabelText('login.email'), 'user@example.com');
  fireEvent.changeText(view.getByLabelText('login.password'), 'correct-password');
  fireEvent.press(view.getByRole('button', { name: 'login.button' }));

  await waitFor(() => expect(view.getByText('login.genericError')).toBeTruthy());
  expect(mockSetToken).not.toHaveBeenCalled();
  expect(setIsLoggedIn).not.toHaveBeenCalled();
});
