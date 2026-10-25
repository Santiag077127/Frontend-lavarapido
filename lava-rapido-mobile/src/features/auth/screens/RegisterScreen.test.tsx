import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';

import RegisterScreen, { normalizeDocumentNumber } from './RegisterScreen';

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
  expect(view.getByRole('alert')).toHaveTextContent(/política de privacidad/);
});

test.each([
  ['CC', '1234567890'],
  ['TI', '0987654321'],
] as const)('%s acepta 10 dígitos', (documentType, value) => {
  expect(normalizeDocumentNumber(value, documentType)).toBe(value);
});

test.each(['CC', 'TI'] as const)('%s limita 11 dígitos a 10', (documentType) => {
  expect(normalizeDocumentNumber('12345678901', documentType)).toBe('1234567890');
});

test.each(['CC', 'TI'] as const)('%s elimina letras, emojis, espacios y símbolos', (documentType) => {
  expect(normalizeDocumentNumber('12A 34😀-56', documentType)).toBe('123456');
});

test('CE conserva su regla actual sin límite de 10 dígitos', () => {
  expect(normalizeDocumentNumber('123456789012', 'CE')).toBe('123456789012');
});

test('muestra la privacidad y los términos desde el registro sin marcar los controles', () => {
  const view = renderScreen();

  const privacyCheckbox = view.getByRole('checkbox', { name: 'He leído la política de privacidad' });
  const termsCheckbox = view.getByRole('checkbox', { name: 'Acepto los términos y condiciones' });

  expect(privacyCheckbox.props.accessibilityState.checked).toBe(false);
  expect(termsCheckbox.props.accessibilityState.checked).toBe(false);

  fireEvent.press(view.getByRole('link', { name: 'Política de privacidad' }));
  expect(view.getByRole('header')).toHaveTextContent('Política de privacidad');
  expect(view.getByText('1. Datos tratados')).toBeTruthy();
  fireEvent.press(view.getByRole('button', { name: 'Cerrar' }));

  fireEvent.press(view.getByRole('link', { name: 'Términos y condiciones' }));
  expect(view.getByRole('header')).toHaveTextContent('Términos y condiciones');
  expect(view.getByText('5. Reservas y pagos')).toBeTruthy();
});

test('bloquea el registro hasta completar las dos confirmaciones requeridas', () => {
  const view = renderScreen();

  fireEvent.press(view.getByRole('button', { name: 'register.button' }));

  expect(mockRegister).not.toHaveBeenCalled();
  expect(view.getByRole('alert')).toHaveTextContent(/Debes leer la política de privacidad/);
});

test('permite el registro con ambas confirmaciones y conserva el payload actual', async () => {
  mockRegister.mockResolvedValueOnce({});
  const view = renderScreen();

  fireEvent.changeText(view.getByLabelText('register.email'), 'cliente@example.com');
  fireEvent.changeText(view.getByLabelText('register.firstName'), 'Ana');
  fireEvent.changeText(view.getByLabelText('register.lastName'), 'Pérez');
  fireEvent.changeText(view.getByLabelText('register.phone'), '3001234567');
  fireEvent.changeText(view.getByLabelText('register.documentNumber'), '1234567890');
  fireEvent.changeText(view.getByLabelText('register.password'), 'Password1');
  fireEvent.changeText(view.getByLabelText('register.confirmPassword'), 'Password1');
  fireEvent.press(view.getByRole('checkbox', { name: 'He leído la política de privacidad' }));
  fireEvent.press(view.getByRole('checkbox', { name: 'Acepto los términos y condiciones' }));

  await act(async () => {
    fireEvent.press(view.getByRole('button', { name: 'register.button' }));
  });

  await waitFor(() => expect(mockRegister).toHaveBeenCalledTimes(1));
  expect(mockRegister).toHaveBeenCalledWith({
    email: 'cliente@example.com',
    firstName: 'Ana',
    lastName: 'Pérez',
    phoneNumber: '3001234567',
    documentType: 'CC',
    documentNumber: '1234567890',
    password: 'Password1',
  });
});
