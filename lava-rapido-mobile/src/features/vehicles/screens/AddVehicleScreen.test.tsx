import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { KeyboardAvoidingView, ScrollView } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AddVehicleScreen from './AddVehicleScreen';

const mockAlert = jest.fn();
const mockCreate = jest.fn();
const mockGetActiveBrands = jest.fn();
const mockClassifyApiError = jest.fn();

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('@expo/vector-icons/Ionicons', () => () => null);

jest.mock('../../../theme/ThemeContext', () => ({
  ThemeContext: require('react').createContext({
    theme: {
      background: '#fff', card: '#fff', border: '#ddd', text: '#111', textSecondary: '#666',
      primary: '#06c', primarySoft: '#def', onPrimary: '#fff', overlay: 'rgba(0,0,0,.4)',
    },
  }),
}));

jest.mock('../../../components/common/BackButton', () => ({ __esModule: true, default: () => null }));
jest.mock('../../../components/notifications/NotificationProvider', () => ({
  appAlert: { alert: (...args: unknown[]) => mockAlert(...args) },
}));
jest.mock('../../../services/api', () => ({
  classifyApiError: (...args: unknown[]) => mockClassifyApiError(...args),
}));
jest.mock('../../../services/vehicleService', () => ({
  vehicleService: {
    create: (...args: unknown[]) => mockCreate(...args),
    update: jest.fn(),
    getActiveBrands: (...args: unknown[]) => mockGetActiveBrands(...args),
  },
}));

const navigation = { goBack: jest.fn() };

function renderScreen() {
  return render(
    <SafeAreaProvider initialMetrics={{
      frame: { x: 0, y: 0, width: 360, height: 740 },
      insets: { top: 24, right: 0, bottom: 24, left: 0 },
    }}>
      <AddVehicleScreen navigation={navigation} route={{ params: {} }} />
    </SafeAreaProvider>,
  );
}

function renderEditScreen() {
  return render(
    <SafeAreaProvider initialMetrics={{
      frame: { x: 0, y: 0, width: 360, height: 740 },
      insets: { top: 24, right: 0, bottom: 24, left: 0 },
    }}>
      <AddVehicleScreen navigation={navigation} route={{ params: {
        vehicle: {
          idVehiculo: 'vehicle-1', idMarca: 'brand-1', placa: 'ABC123', color: 'Negro', tipoVehiculo: 'CARRO',
        },
      } }} />
    </SafeAreaProvider>,
  );
}

async function completeRequiredFields(view: ReturnType<typeof renderScreen>) {
  await waitFor(() => expect(mockGetActiveBrands).toHaveBeenCalled());
  fireEvent.changeText(view.getByLabelText('vehicles.fields.plate'), 'ABC123');
  fireEvent.press(view.getByRole('button', { name: 'vehicles.fields.brand: vehicles.form.selectBrand' }));
  fireEvent.press(await view.findByText('Toyota'));
}

beforeEach(() => {
  jest.clearAllMocks();
  mockGetActiveBrands.mockResolvedValue({ data: [{ idMarca: 'brand-1', nombre: 'Toyota', estado: true }] });
  mockClassifyApiError.mockReturnValue('unknown');
});

test('muestra una notificación visual de éxito sólo tras confirmar el registro', async () => {
  let resolveCreate: ((value: unknown) => void) | undefined;
  mockCreate.mockImplementation(() => new Promise((resolve) => { resolveCreate = resolve; }));
  const view = renderScreen();
  await completeRequiredFields(view);

  fireEvent.press(view.getByRole('button', { name: 'vehicles.actions.add' }));

  await waitFor(() => expect(mockCreate).toHaveBeenCalledWith({
    placa: 'ABC123', color: '', tipoVehiculo: 'CARRO', fkIdMarca: 'brand-1',
  }));
  expect(mockAlert).not.toHaveBeenCalled();
  await act(async () => resolveCreate?.({ data: { idVehiculo: 'vehicle-1' } }));
  await waitFor(() => expect(mockAlert).toHaveBeenCalledTimes(1));
  expect(mockAlert).toHaveBeenLastCalledWith(
    'vehicles.form.createdTitle',
    'vehicles.form.createdMessage',
    expect.any(Array),
    'success',
  );
  expect(navigation.goBack).not.toHaveBeenCalled();
  expect(mockAlert).toHaveBeenCalledTimes(1);
  const buttons = mockAlert.mock.calls[0][2] as Array<{ onPress?: () => void }>;
  await act(async () => buttons[0].onPress?.());
  expect(navigation.goBack).toHaveBeenCalledTimes(1);
});

test('muestra un error visual de validación sin enviar el registro', async () => {
  const view = renderScreen();
  await waitFor(() => expect(mockGetActiveBrands).toHaveBeenCalled());

  fireEvent.press(view.getByRole('button', { name: 'vehicles.actions.add' }));

  expect(mockCreate).not.toHaveBeenCalled();
  expect(mockAlert).toHaveBeenLastCalledWith(
    'vehicles.form.plateRequiredTitle',
    'vehicles.form.plateRequired',
    undefined,
    'error',
  );
});

test('clasifica duplicado de placa por el mensaje real del backend sin mostrar texto interno', async () => {
  mockCreate.mockRejectedValueOnce({
    isAxiosError: true,
    response: {
      status: 400,
      data: 'Ya existe un vehículo registrado con esa placa',
    },
  });
  const view = renderScreen();
  await completeRequiredFields(view);

  fireEvent.press(view.getByRole('button', { name: 'vehicles.actions.add' }));
  await waitFor(() => expect(mockAlert).toHaveBeenLastCalledWith(
    'vehicles.errors.title', 'vehicles.errors.conflict', undefined, 'error',
  ));
  expect(mockAlert.mock.calls.flat().join(' ')).not.toContain('Ya existe un vehículo registrado con esa placa');
});

test('trata un HTTP 409 genérico como error de guardado, no como duplicado confirmado', async () => {
  mockCreate.mockRejectedValueOnce({
    isAxiosError: true,
    response: { status: 409, data: { message: 'internal' } },
  });
  const view = renderScreen();
  await completeRequiredFields(view);

  fireEvent.press(view.getByRole('button', { name: 'vehicles.actions.add' }));
  await waitFor(() => expect(mockAlert).toHaveBeenLastCalledWith(
    'vehicles.errors.title', 'vehicles.errors.conflict', undefined, 'error',
  ));
});

test('clasifica pérdida de conexión sin exponer el error técnico', async () => {
  mockCreate.mockRejectedValueOnce({ code: 'ERR_NETWORK', message: 'technical detail' });
  mockClassifyApiError.mockReturnValueOnce('network');
  const view = renderScreen();
  await completeRequiredFields(view);

  fireEvent.press(view.getByRole('button', { name: 'vehicles.actions.add' }));
  await waitFor(() => expect(mockAlert).toHaveBeenLastCalledWith(
    'vehicles.errors.title', 'apiErrors.network', undefined, 'error',
  ));
});

test('muestra un mensaje validado y seguro para otros errores HTTP 400', async () => {
  mockCreate.mockRejectedValueOnce({
    isAxiosError: true,
    response: { status: 400, data: 'detalle interno del servidor' },
  });
  const view = renderScreen();
  await completeRequiredFields(view);

  fireEvent.press(view.getByRole('button', { name: 'vehicles.actions.add' }));
  await waitFor(() => expect(mockAlert).toHaveBeenLastCalledWith(
    'vehicles.errors.title', 'vehicles.errors.badRequest', undefined, 'error',
  ));
  expect(mockAlert).toHaveBeenCalledTimes(1);
  expect(mockAlert.mock.calls.flat().join(' ')).not.toContain('detalle interno');
  expect(view.getByLabelText('vehicles.fields.plate').props.value).toBe('ABC123');
});

test('no repite el mensaje de sesión cuando la respuesta 401 ya activa el logout global', async () => {
  mockCreate.mockRejectedValueOnce({
    isAxiosError: true,
    response: { status: 401, data: 'unauthorized' },
  });
  mockClassifyApiError.mockReturnValueOnce('unauthorized');
  const view = renderScreen();
  await completeRequiredFields(view);

  fireEvent.press(view.getByRole('button', { name: 'vehicles.actions.add' }));
  await waitFor(() => expect(mockCreate).toHaveBeenCalledTimes(1));
  await act(async () => Promise.resolve());

  expect(mockAlert).not.toHaveBeenCalled();
});

test('bloquea pulsaciones repetidas mientras el alta está pendiente', async () => {
  let resolveCreate: (() => void) | undefined;
  mockCreate.mockImplementation(() => new Promise<void>((resolve) => { resolveCreate = resolve; }));
  const view = renderScreen();
  await completeRequiredFields(view);

  const save = view.getByRole('button', { name: 'vehicles.actions.add' });
  fireEvent.press(save);
  fireEvent.press(save);

  expect(mockCreate).toHaveBeenCalledTimes(1);
  expect(view.getByRole('button', { name: 'vehicles.form.saving' }).props.accessibilityState.disabled).toBe(true);
  await act(async () => resolveCreate?.());
  expect(mockAlert).toHaveBeenCalledTimes(1);
});

test('el formulario largo configura desplazamiento, taps y resize para Android', async () => {
  const view = renderScreen();
  const appConfig = require('../../../../app.json');

  await waitFor(() => expect(mockGetActiveBrands).toHaveBeenCalled());
  expect(view.UNSAFE_getByType(KeyboardAvoidingView)).toBeTruthy();
  expect(view.UNSAFE_getAllByType(ScrollView).some(
    (scrollView) => scrollView.props.keyboardShouldPersistTaps === 'handled',
  )).toBe(true);
  const formScrollView = view.UNSAFE_getAllByType(ScrollView).find(
    (scrollView) => scrollView.props.keyboardShouldPersistTaps === 'handled'
      && !scrollView.props.style,
  );
  const contentStyle = Array.isArray(formScrollView?.props.contentContainerStyle)
    ? formScrollView.props.contentContainerStyle.reduce(
      (styles: Record<string, unknown>, style: Record<string, unknown>) => ({ ...styles, ...style }),
      {},
    )
    : formScrollView?.props.contentContainerStyle;
  expect(contentStyle?.flexGrow).toBe(1);
  expect(contentStyle?.paddingBottom).toBeGreaterThanOrEqual(24);
  expect(appConfig.expo.android.softwareKeyboardLayoutMode).toBe('resize');
});

test('shows the safe HU-31 plate message returned in HTTP 400', async () => {
  mockCreate.mockRejectedValueOnce({
    isAxiosError: true,
    response: { status: 400, data: { error: 'Para MOTO, la placa debe tener el formato ABC12D' } },
  });
  const view = renderScreen();
  await completeRequiredFields(view);

  fireEvent.press(view.getByRole('button', { name: 'vehicles.actions.add' }));
  await waitFor(() => expect(mockAlert).toHaveBeenLastCalledWith(
    'vehicles.errors.title', 'Para MOTO, la placa debe tener el formato ABC12D', undefined, 'error',
  ));
});

test('revalidates and disables save when the vehicle type changes', async () => {
  const view = renderScreen();
  await waitFor(() => expect(mockGetActiveBrands).toHaveBeenCalled());
  fireEvent.changeText(view.getByLabelText('vehicles.fields.plate'), 'ABC123');
  fireEvent.press(view.getByRole('radio', { name: 'vehicles.types.motorcycle' }));

  expect(view.getByRole('button', { name: 'vehicles.actions.add' }).props.accessibilityState.disabled).toBe(true);
  expect(view.getByText('vehicles.fields.type: vehicles.types.motorcycle · ABC12D')).toBeTruthy();
});

test('updates a vehicle with the normalized plate and unchanged API type', async () => {
  const update = require('../../../services/vehicleService').vehicleService.update as jest.Mock;
  update.mockResolvedValueOnce({ data: { idVehiculo: 'vehicle-1' } });
  const view = renderEditScreen();
  await waitFor(() => expect(mockGetActiveBrands).toHaveBeenCalled());
  fireEvent.changeText(view.getByLabelText('vehicles.fields.plate'), ' abc123 ');

  fireEvent.press(view.getByRole('button', { name: 'vehicles.form.saveChanges' }));
  await waitFor(() => expect(update).toHaveBeenCalledWith('vehicle-1', {
    placa: 'ABC123', color: 'Negro', tipoVehiculo: 'CARRO', fkIdMarca: 'brand-1',
  }));
});
