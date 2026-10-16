import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';

import RegisterScreen from './RegisterScreen';

const mockRegister = jest.fn();
const mockNavigate = jest.fn();

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

jest.mock('@expo/vector-icons', () => ({
  Feather: () => null,
  Ionicons: () => null,
  MaterialIcons: () => null,
}));

jest.mock('../../../theme/ThemeContext', () => ({
  ThemeContext: require('react').createContext({
    theme: {
      background: '#fff',
      surface: '#f5f5f5',
      text: '#111',
      textSecondary: '#666',
      inputBackground: '#fff',
      icon: '#666',
      border: '#ddd',
      primaryDark: '#06c',
      onPrimary: '#fff',
      successText: '#080',
      errorText: '#c00',
      errorBackground: '#fee',
      errorBorder: '#f88',
      successBackground: '#efe',
      successBorder: '#8c8',
    },
    darkMode: false,
  }),
}));

jest.mock('../../../services/authService', () => ({
  authService: {
    register: (...args: unknown[]) => mockRegister(...args),
  },
}));

const renderScreen = () => render(<RegisterScreen setIsLoggedIn={jest.fn()} />);

beforeEach(() => {
  jest.clearAllMocks();
});

test('mantiene el formulario desplazable con el teclado abierto en Android', () => {
  const view = renderScreen();
  const keyboardAvoidingView = view.UNSAFE_getByType(KeyboardAvoidingView);
  const scrollView = view.UNSAFE_getByType(ScrollView);
  const contentStyle = Array.isArray(scrollView.props.contentContainerStyle)
    ? scrollView.props.contentContainerStyle.reduce(
      (styles: Record<string, unknown>, style: Record<string, unknown>) => ({ ...styles, ...style }),
      {},
    )
    : scrollView.props.contentContainerStyle;

  expect(keyboardAvoidingView.props.behavior).toBe(
    Platform.OS === 'ios' ? 'padding' : 'height',
  );
  expect(scrollView.props.keyboardShouldPersistTaps).toBe('handled');
  expect(scrollView.props.keyboardDismissMode).toBe('none');
  expect(contentStyle.flexGrow).toBe(1);
  expect(contentStyle.paddingBottom).toBeGreaterThan(0);
  expect(view.getByRole('button', { name: 'register.button' })).toBeTruthy();
});

test('conserva la validación del formulario y muestra el mensaje dentro del contenido desplazable', () => {
  const view = renderScreen();

  fireEvent.press(view.getByRole('button', { name: 'register.button' }));

  expect(mockRegister).not.toHaveBeenCalled();
  expect(view.getByRole('alert')).toHaveTextContent(/register\.required/);
});
