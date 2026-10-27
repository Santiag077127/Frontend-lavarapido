jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

import { getConfirmationBorderColor, getConfirmationState } from './ChangePasswordScreen';
import { darkTheme, lightTheme } from '../../../theme/themeTokens';

test('mantiene el estado neutral antes de interactuar o cuando la confirmación está vacía', () => {
  expect(getConfirmationState('', '', false)).toBe('neutral');
  expect(getConfirmationState('ValidPass1', '', true)).toBe('neutral');
});

test('marca como válida una coincidencia con una nueva contraseña válida', () => {
  expect(getConfirmationState('ValidPass1', 'ValidPass1', true)).toBe('valid');
});

test('marca en rojo una confirmación diferente después de interactuar', () => {
  expect(getConfirmationState('ValidPass1', 'OtherPass1', true)).toBe('invalid');
});

test('actualiza el estado cuando cambia la nueva contraseña o se corrige la confirmación', () => {
  expect(getConfirmationState('ChangedPass1', 'ValidPass1', true)).toBe('invalid');
  expect(getConfirmationState('ChangedPass1', 'ChangedPass1', true)).toBe('valid');
});

test('no muestra éxito si ambas contraseñas coinciden pero la nueva es inválida', () => {
  expect(getConfirmationState('short', 'short', true)).toBe('neutral');
});

test.each([lightTheme, darkTheme])('usa el token de error visible del tema para ambas contraseñas', (theme) => {
  expect(getConfirmationBorderColor('invalid', theme)).toBe(theme.error);
  expect(getConfirmationBorderColor('valid', theme)).toBe(theme.success);
  expect(getConfirmationBorderColor('neutral', theme)).toBe(theme.border);
});
