import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { KeyboardAvoidingView, ScrollView } from 'react-native';

import EditProfileScreen from './EditProfileScreen';

const mockAlert = jest.fn();
const mockGetProfile = jest.fn();
const mockUpdateProfile = jest.fn();
const mockChangeEmail = jest.fn();
const mockInvalidateSession = jest.fn();
const mockNavigation = { goBack: jest.fn(), navigate: jest.fn() };

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
  useFocusEffect: (callback: () => void) => require('react').useEffect(callback, [callback]),
}));
jest.mock('../../../theme/ThemeContext', () => ({
  ThemeContext: require('react').createContext({
    theme: {
      background: '#fff',
      card: '#fff',
      border: '#ddd',
      text: '#111',
      textSecondary: '#666',
      inputBackground: '#f5f5f5',
      primary: '#06c',
      primaryContainer: '#def',
      onPrimary: '#fff',
    },
    darkMode: false,
  }),
}));
jest.mock('../../../components/common/BackButton', () => ({ __esModule: true, default: () => null }));
jest.mock('../../../components/notifications/NotificationProvider', () => ({
  appAlert: { alert: (...args: unknown[]) => mockAlert(...args) },
}));
jest.mock('../../../services/userService', () => ({
  userService: {
    getProfile: (...args: unknown[]) => mockGetProfile(...args),
    updateProfile: (...args: unknown[]) => mockUpdateProfile(...args),
    changeEmail: (...args: unknown[]) => mockChangeEmail(...args),
  },
}));
jest.mock('../../../services/api', () => ({
  invalidateSession: () => mockInvalidateSession(),
}));
jest.mock('../../../assets/images', () => ({
  images: {
    avatar1: 1,
    avatar2: 2,
    avatar3: 3,
    avatar4: 4,
    avatar5: 5,
  },
}));

const profile = {
  userId: 'user-1',
  email: 'old@example.com',
  firstName: 'Test',
  lastName: 'User',
  phoneNumber: '3000000000',
  profilePicture: 'avatar_1',
};

function renderScreen() {
  return render(<EditProfileScreen />);
}

async function waitForProfile(view: ReturnType<typeof renderScreen>) {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
  await waitFor(() => expect(view.getByLabelText('emailChange.newEmail')).toBeTruthy());
}

async function fillEmailFields(view: ReturnType<typeof renderScreen>, email = '  NEW@Example.COM  ') {
  await waitForProfile(view);
  fireEvent.changeText(view.getByLabelText('emailChange.newEmail'), email);
  fireEvent.changeText(view.getByLabelText('emailChange.currentPassword'), 'current-password');
}

beforeEach(() => {
  jest.clearAllMocks();
  mockGetProfile.mockResolvedValue(profile);
  mockUpdateProfile.mockResolvedValue(profile);
});

test('el formulario de correo permanece desplazable y acepta taps con el teclado visible', async () => {
  const view = renderScreen();
  await waitForProfile(view);

  expect(view.UNSAFE_getByType(KeyboardAvoidingView)).toBeTruthy();
  expect(view.UNSAFE_getAllByType(ScrollView).some(
    (scrollView) => scrollView.props.keyboardShouldPersistTaps === 'handled',
  )).toBe(true);
});

test('separa la información personal del correo y coloca Guardar cambios debajo del teléfono', async () => {
  const view = renderScreen();
  await waitForProfile(view);

  const tree = JSON.stringify(view.toJSON());
  const phoneIndex = tree.indexOf('editProfile.phone');
  const saveIndex = tree.indexOf('editProfile.save');
  const emailSectionIndex = tree.indexOf('emailChange.title');

  expect(view.queryByLabelText('editProfile.email')).toBeNull();
  expect(view.queryByText('editProfile.emailReadOnly')).toBeNull();
  expect(view.getByText('emailChange.title')).toBeTruthy();
  expect(view.getByText('editProfile.profilePhoto')).toBeTruthy();
  expect(phoneIndex).toBeGreaterThanOrEqual(0);
  expect(phoneIndex).toBeLessThan(saveIndex);
  expect(saveIndex).toBeLessThan(emailSectionIndex);
});

test('Guardar cambios actualiza solo el perfil y no el correo', async () => {
  const view = renderScreen();
  await waitForProfile(view);

  fireEvent.changeText(view.getByLabelText('editProfile.firstName'), 'Updated');
  fireEvent.changeText(view.getByLabelText('editProfile.lastName'), 'Person');
  fireEvent.changeText(view.getByLabelText('editProfile.phone'), '3111111111');
  fireEvent.press(view.getByRole('button', { name: 'editProfile.save' }));

  await waitFor(() => expect(mockUpdateProfile).toHaveBeenCalledWith({
    firstName: 'Updated',
    lastName: 'Person',
    phoneNumber: '3111111111',
    profilePicture: 'avatar_1',
  }));
  expect(mockChangeEmail).not.toHaveBeenCalled();
});

test('ofrece el cambio de contraseña dentro de editar perfil y conserva el formulario existente', async () => {
  const view = renderScreen();
  await waitForProfile(view);

  expect(view.getByText('emailChange.title')).toBeTruthy();
  expect(view.queryByText('editProfile.emailReadOnly')).toBeNull();

  fireEvent.press(view.getByRole('button', { name: 'changePassword.menuTitle' }));

  expect(mockNavigation.navigate).toHaveBeenCalledWith('ChangePassword');
});

test('valida el formato antes de enviar el cambio de correo', async () => {
  const view = renderScreen();
  await fillEmailFields(view, 'not-an-email');

  fireEvent.press(view.getByRole('button', { name: 'emailChange.submit' }));

  expect(mockChangeEmail).not.toHaveBeenCalled();
  expect(mockAlert).toHaveBeenCalledWith(
    'emailChange.errorTitle',
    'emailChange.invalidEmail',
    undefined,
    'warning',
  );
});

test('envía el correo normalizado y termina la sesión al confirmar el cambio', async () => {
  mockChangeEmail.mockResolvedValue({ ...profile, email: 'new@example.com' });
  const view = renderScreen();
  await fillEmailFields(view);

  fireEvent.press(view.getByRole('button', { name: 'emailChange.submit' }));

  await waitFor(() => expect(mockChangeEmail).toHaveBeenCalledWith({
    currentPassword: 'current-password',
    newEmail: 'new@example.com',
  }));
  expect(mockInvalidateSession).toHaveBeenCalledTimes(1);
  expect(mockAlert).toHaveBeenLastCalledWith(
    'emailChange.successTitle',
    'emailChange.successMessage',
    [{ text: 'common.accept' }],
    'success',
  );
  expect(view.getByLabelText('emailChange.newEmail').props.value).toBe('');
  expect(view.getByLabelText('emailChange.currentPassword').props.value).toBe('');
});

test('muestra error de contraseña y conserva el formulario si el backend rechaza la contraseña', async () => {
  mockChangeEmail.mockRejectedValue({
    isAxiosError: true,
    response: { status: 400, data: { error: 'CURRENT_PASSWORD_INVALID' } },
  });
  const view = renderScreen();
  await fillEmailFields(view);

  fireEvent.press(view.getByRole('button', { name: 'emailChange.submit' }));

  await waitFor(() => expect(mockAlert).toHaveBeenLastCalledWith(
    'emailChange.errorTitle',
    'emailChange.incorrectPassword',
    undefined,
    'error',
  ));
  expect(view.getByLabelText('emailChange.newEmail').props.value).toBe('  NEW@Example.COM  ');
  expect(view.getByLabelText('emailChange.currentPassword').props.value).toBe('current-password');
  expect(mockInvalidateSession).not.toHaveBeenCalled();
});

test('clasifica un correo duplicado sin mostrar el detalle interno del servidor', async () => {
  mockChangeEmail.mockRejectedValue({
    isAxiosError: true,
    response: { status: 409, data: { error: 'internal backend detail' } },
  });
  const view = renderScreen();
  await fillEmailFields(view);

  fireEvent.press(view.getByRole('button', { name: 'emailChange.submit' }));

  await waitFor(() => expect(mockAlert).toHaveBeenLastCalledWith(
    'emailChange.errorTitle',
    'emailChange.conflict',
    undefined,
    'error',
  ));
  expect(mockAlert.mock.calls.flat().join(' ')).not.toContain('internal backend detail');
  expect(mockInvalidateSession).not.toHaveBeenCalled();
});

test('muestra un mensaje de timeout y conserva los datos ingresados', async () => {
  mockChangeEmail.mockRejectedValue({
    isAxiosError: true,
    code: 'ECONNABORTED',
  });
  const view = renderScreen();
  await fillEmailFields(view);

  fireEvent.press(view.getByRole('button', { name: 'emailChange.submit' }));

  await waitFor(() => expect(mockAlert).toHaveBeenLastCalledWith(
    'emailChange.errorTitle',
    'emailChange.timeout',
    undefined,
    'error',
  ));
  expect(view.getByLabelText('emailChange.newEmail').props.value).toBe('  NEW@Example.COM  ');
  expect(view.getByLabelText('emailChange.currentPassword').props.value).toBe('current-password');
  expect(mockInvalidateSession).not.toHaveBeenCalled();
});

test('bloquea solicitudes duplicadas mientras el cambio de correo está pendiente', async () => {
  let resolveChange: ((value: typeof profile) => void) | undefined;
  mockChangeEmail.mockImplementation(() => new Promise((resolve) => { resolveChange = resolve; }));
  const view = renderScreen();
  await fillEmailFields(view);

  fireEvent.press(view.getByRole('button', { name: 'emailChange.submit' }));
  fireEvent.press(view.getByRole('button', { name: 'emailChange.submit' }));

  await waitFor(() => expect(mockChangeEmail).toHaveBeenCalledTimes(1));
  await act(async () => resolveChange?.({ ...profile, email: 'new@example.com' }));
  expect(mockChangeEmail).toHaveBeenCalledTimes(1);
});

test('shows loading and a safe error after a failed profile request', async () => {
  mockGetProfile.mockRejectedValueOnce({ response: { status: 503 } });
  const view = renderScreen();
  expect(view.getByText('editProfile.loadingTitle')).toBeTruthy();
  await waitFor(() => expect(mockAlert).toHaveBeenCalledWith(
    'editProfile.errorTitle', 'editProfile.loadError', undefined, 'error',
  ));
  expect(mockGetProfile).toHaveBeenCalledTimes(1);
});

test('selects an avatar while preserving the profile update contract', async () => {
  const view = renderScreen();
  await waitForProfile(view);
  fireEvent.press(view.getAllByRole('radio')[2]);
  fireEvent.press(view.getByRole('button', { name: 'editProfile.save' }));

  await waitFor(() => expect(mockUpdateProfile).toHaveBeenCalledWith({
    firstName: 'Test', lastName: 'User', phoneNumber: '3000000000', profilePicture: 'avatar_3',
  }));
  expect(mockUpdateProfile).toHaveBeenCalledTimes(1);
  expect(mockChangeEmail).not.toHaveBeenCalled();
});

test('rejects missing personal data without sending a profile request', async () => {
  const view = renderScreen();
  await waitForProfile(view);
  fireEvent.changeText(view.getByLabelText('editProfile.firstName'), '');
  fireEvent.press(view.getByRole('button', { name: 'editProfile.save' }));

  expect(mockUpdateProfile).not.toHaveBeenCalled();
  expect(mockAlert).toHaveBeenCalledWith(
    'editProfile.requiredTitle', 'editProfile.firstNameRequired', undefined, 'warning',
  );
});

test('disables profile submission while the update request is pending', async () => {
  let resolveUpdate: ((value: typeof profile) => void) | undefined;
  mockUpdateProfile.mockImplementationOnce(() => new Promise(resolve => { resolveUpdate = resolve; }));
  const view = renderScreen();
  await waitForProfile(view);
  fireEvent.press(view.getByRole('button', { name: 'editProfile.save' }));

  const busyButton = view.getByRole('button', { name: 'editProfile.save, accessibility.inProgress' });
  expect(busyButton.props.accessibilityState).toEqual({ disabled: true, busy: true });
  fireEvent.press(busyButton);
  expect(mockUpdateProfile).toHaveBeenCalledTimes(1);
  await act(async () => resolveUpdate?.(profile));
});
