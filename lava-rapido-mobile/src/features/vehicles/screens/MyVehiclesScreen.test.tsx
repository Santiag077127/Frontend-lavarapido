import React from 'react';
import { Alert } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import MyVehiclesScreen from './MyVehiclesScreen';
import { vehicleService } from '../../../services/vehicleService';

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
jest.mock('@expo/vector-icons/Ionicons', () => () => null);
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (callback: () => void) => require('react').useEffect(callback, [callback]),
}));
jest.mock('../../../theme/ThemeContext', () => ({
  ThemeContext: require('react').createContext({
    theme: new Proxy({}, { get: () => '#fff' }),
  }),
}));
jest.mock('../../../components/common/ScreenHeader', () => () => null);
jest.mock('../../../components/notifications/ConfirmationModal', () => ({
  __esModule: true,
  default: ({ visible, confirmLabel, onConfirm }: {
    visible: boolean;
    confirmLabel: string;
    onConfirm: () => void;
  }) => {
    if (!visible) return null;
    const { Pressable, Text } = require('react-native');
    return require('react').createElement(Pressable, {
      accessibilityRole: 'button',
      accessibilityLabel: confirmLabel,
      onPress: onConfirm,
    }, require('react').createElement(Text, null, confirmLabel));
  },
}));
jest.mock('../../../services/vehicleService', () => ({
  vehicleService: {
    getMine: jest.fn(),
    changeStatus: jest.fn(),
  },
}));
jest.mock('../../../services/api', () => ({
  classifyApiError: jest.fn(() => 'server_unavailable'),
}));

const sampleVehicle = {
  idVehiculo: 'vehicle-1',
  userId: 'user-1',
  nombreUsuario: 'User',
  emailUsuario: 'user@example.test',
  idMarca: 'brand-1',
  nombreMarca: 'Toyota',
  marcaAprobada: true,
  placa: 'ABC123',
  color: 'Negro',
  tipoVehiculo: 'CARRO' as const,
  estado: true,
  createdAt: '2026-01-01T00:00:00Z',
};

function renderScreen() {
  return render(
    <SafeAreaProvider initialMetrics={{
      frame: { x: 0, y: 0, width: 360, height: 740 },
      insets: { top: 24, right: 0, bottom: 24, left: 0 },
    }}>
      <MyVehiclesScreen navigation={{ navigate: jest.fn(), goBack: jest.fn() }} />
    </SafeAreaProvider>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  (vehicleService.getMine as jest.Mock).mockResolvedValue({ data: [sampleVehicle] });
});

test('shows the empty state when the vehicle list is empty', async () => {
  (vehicleService.getMine as jest.Mock).mockResolvedValueOnce({ data: [] });
  const view = renderScreen();

  await waitFor(() => expect(view.getByText('vehicles.empty.title')).toBeTruthy());
  expect(vehicleService.getMine).toHaveBeenCalledTimes(1);
});

test('shows a safe HTTP load error and retries the list request', async () => {
  (vehicleService.getMine as jest.Mock)
    .mockRejectedValueOnce({ response: { status: 503 } })
    .mockResolvedValueOnce({ data: [sampleVehicle] });
  const view = renderScreen();

  await waitFor(() => expect(view.getByText('apiErrors.server_unavailable')).toBeTruthy());
  fireEvent.press(view.getByRole('button', { name: 'common.retry' }));

  await waitFor(() => expect(view.getByText('ABC123')).toBeTruthy());
  expect(vehicleService.getMine).toHaveBeenCalledTimes(2);
});

test('loads vehicles once and applies the confirmed status change once', async () => {
  const view = renderScreen();
  await waitFor(() => expect(view.getByText('ABC123')).toBeTruthy());

  fireEvent.press(view.getByRole('button', { name: 'Eliminar: ABC123' }));
  fireEvent.press(view.getByRole('button', { name: 'vehicles.status.deactivate' }));

  await waitFor(() => expect(vehicleService.changeStatus).toHaveBeenCalledWith('vehicle-1', false));
  expect(vehicleService.getMine).toHaveBeenCalledTimes(2);
});

test('does not send duplicate status requests when confirmation is triggered twice before rerender', async () => {
  const view = renderScreen();
  await waitFor(() => expect(view.getByText('ABC123')).toBeTruthy());
  fireEvent.press(view.getByRole('button', { name: 'Eliminar: ABC123' }));

  await act(async () => {
    const confirmButton = view.getByRole('button', { name: 'vehicles.status.deactivate' });
    fireEvent.press(confirmButton);
    fireEvent.press(confirmButton);
  });

  expect(vehicleService.changeStatus).toHaveBeenCalledTimes(1);
});

test('reports a status update failure without hiding the loaded vehicle', async () => {
  const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  (vehicleService.changeStatus as jest.Mock).mockRejectedValueOnce({ response: { status: 500 } });
  const view = renderScreen();
  await waitFor(() => expect(view.getByText('ABC123')).toBeTruthy());

  fireEvent.press(view.getByRole('button', { name: 'Eliminar: ABC123' }));
  fireEvent.press(view.getByRole('button', { name: 'vehicles.status.deactivate' }));

  await waitFor(() => expect(alertSpy).toHaveBeenCalledWith('vehicles.errors.title', 'apiErrors.server_unavailable'));
  expect(view.getByText('ABC123')).toBeTruthy();
  alertSpy.mockRestore();
  errorSpy.mockRestore();
});
