import React from 'react';
import { RefreshControl } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';

import MyReservationsScreen from './MyReservationsScreen';
import type { ReservationResponse } from '../types/reservation.types';

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockGetProfile = jest.fn();
const mockGetByUser = jest.fn();
const mockCancel = jest.fn();
const mockAlert = jest.fn();
const mockClassifyApiError = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (callback: () => void) => require('react').useEffect(callback, [callback]),
  useNavigation: () => ({ navigate: mockNavigate, goBack: mockGoBack }),
}));
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
jest.mock('../../../theme/ThemeContext', () => ({
  ThemeContext: require('react').createContext({
    theme: new Proxy({}, { get: () => '#fff' }),
    darkMode: false,
  }),
}));
jest.mock('../../../components/common/ScreenHeader', () => () => null);
jest.mock('../../../components/notifications/NotificationProvider', () => ({
  appAlert: { alert: (...args: unknown[]) => mockAlert(...args) },
}));
jest.mock('../../../components/notifications/ConfirmationModal', () => ({
  __esModule: true,
  default: ({ visible, title, message, confirmLabel, cancelLabel, onConfirm, onCancel }: {
    visible: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    cancelLabel: string;
    onConfirm: () => void;
    onCancel: () => void;
  }) => {
    if (!visible) return null;
    const ReactModule = require('react');
    const { Pressable, Text, View } = require('react-native');
    return ReactModule.createElement(View, null,
      ReactModule.createElement(Text, null, title),
      ReactModule.createElement(Text, null, message),
      ReactModule.createElement(Pressable, { accessibilityRole: 'button', onPress: onConfirm },
        ReactModule.createElement(Text, null, confirmLabel)),
      ReactModule.createElement(Pressable, { accessibilityRole: 'button', onPress: onCancel },
        ReactModule.createElement(Text, null, cancelLabel)),
    );
  },
}));
jest.mock('../../../services/api', () => ({
  __esModule: true,
  default: { get: (...args: unknown[]) => mockGetProfile(...args) },
  classifyApiError: (...args: unknown[]) => mockClassifyApiError(...args),
}));
jest.mock('../services/reservationService', () => ({
  reservationService: {
    getByUser: (...args: unknown[]) => mockGetByUser(...args),
    cancel: (...args: unknown[]) => mockCancel(...args),
  },
}));

const reservation: ReservationResponse = {
  idReserva: 'reservation-1',
  idUsuario: 'user-1',
  idVehiculo: 'vehicle-1',
  idServicio: 'service-1',
  nombreUsuario: 'User',
  placaVehiculo: 'ABC123',
  tipoVehiculo: 'CARRO',
  nombreServicio: 'Lavado exterior',
  descripcionServicio: 'Lavado completo',
  precioServicio: 25000,
  duracionServicio: 60,
  fechaReserva: '2026-11-10',
  horaReserva: '10:30:00',
  fechaHoraInicio: null,
  fechaHoraFin: null,
  createdAt: '2026-10-24T00:00:00Z',
  updatedAt: '2026-10-24T00:00:00Z',
  estado: 'PENDIENTE',
};

beforeEach(() => {
  jest.clearAllMocks();
  mockGetProfile.mockResolvedValue({ data: { userId: 'user-1' } });
  mockGetByUser.mockResolvedValue([reservation]);
  mockCancel.mockResolvedValue({ ...reservation, estado: 'CANCELADA' });
  mockClassifyApiError.mockReturnValue('server_unavailable');
});

test('loads the authenticated user reservations once and opens their details', async () => {
  const view = render(<MyReservationsScreen />);

  await waitFor(() => expect(view.getByText('Lavado exterior')).toBeTruthy());
  expect(mockGetProfile).toHaveBeenCalledWith('/api/users/profile');
  expect(mockGetProfile).toHaveBeenCalledTimes(1);
  expect(mockGetByUser).toHaveBeenCalledTimes(1);
  expect(mockGetByUser).toHaveBeenCalledWith('user-1');

  fireEvent.press(view.getByRole('button', { name: 'mobile.services.detail' }));
  expect(mockNavigate).toHaveBeenCalledWith('ServiceDetails', { reservation });
});

test('sorts reservations by date and time without requesting them twice', async () => {
  const earlier = { ...reservation, idReserva: 'earlier', nombreServicio: 'Earlier', horaReserva: '09:00:00' };
  const later = { ...reservation, idReserva: 'later', nombreServicio: 'Later', horaReserva: '11:00:00' };
  mockGetByUser.mockResolvedValueOnce([earlier, later]);

  const view = render(<MyReservationsScreen />);
  await waitFor(() => expect(view.getByText('Later')).toBeTruthy());

  const titles = view.getAllByText(/Earlier|Later/).map(node => node.props.children);
  expect(titles).toEqual(['Later', 'Earlier']);
  expect(mockGetByUser).toHaveBeenCalledTimes(1);
});

test('allows cancellation only for pending and assigned reservations', async () => {
  mockGetByUser.mockResolvedValueOnce([
    { ...reservation, idReserva: 'assigned', nombreServicio: 'Assigned', estado: 'ASIGNADA' },
    { ...reservation, idReserva: 'finished', nombreServicio: 'Finished', estado: 'FINALIZADA' },
  ]);

  const view = render(<MyReservationsScreen />);
  await waitFor(() => expect(view.getByText('Finished')).toBeTruthy());

  expect(view.getByRole('button', { name: 'mobile.reservations.cancelTitle: Assigned' })).toBeTruthy();
  expect(view.queryByRole('button', { name: 'mobile.reservations.cancelTitle: Finished' })).toBeNull();
  expect(mockCancel).not.toHaveBeenCalled();
});

test('shows an empty state and keeps the existing route to Home', async () => {
  mockGetByUser.mockResolvedValueOnce([]);
  const view = render(<MyReservationsScreen />);

  await waitFor(() => expect(view.getByText('mobile.reservations.emptyTitle')).toBeTruthy());
  fireEvent.press(view.getByRole('button', { name: 'mobile.reservations.reserveService' }));
  expect(mockNavigate).toHaveBeenCalledWith('Home');
});

test('retries a loading failure without sending a cancellation request', async () => {
  mockGetByUser.mockRejectedValueOnce({ response: { status: 503 } });
  const view = render(<MyReservationsScreen />);

  await waitFor(() => expect(view.getByText('mobile.reservations.loadErrorTitle')).toBeTruthy());
  fireEvent.press(view.getByRole('button', { name: 'mobile.reservations.retry' }));

  await waitFor(() => expect(view.getByText('Lavado exterior')).toBeTruthy());
  expect(mockGetByUser).toHaveBeenCalledTimes(2);
  expect(mockCancel).not.toHaveBeenCalled();
});

test('keeps a loaded reservation visible after a refresh failure', async () => {
  const view = render(<MyReservationsScreen />);
  await waitFor(() => expect(view.getByText('Lavado exterior')).toBeTruthy());
  mockGetByUser.mockRejectedValueOnce({ response: { status: 503 } });

  act(() => view.UNSAFE_getByType(RefreshControl).props.onRefresh());

  await waitFor(() => expect(view.getByText('apiErrors.server_unavailable apiErrors.staleData')).toBeTruthy());
  expect(view.getByText('Lavado exterior')).toBeTruthy();
  expect(mockGetByUser).toHaveBeenCalledTimes(2);
});

test('asks for confirmation before cancellation and updates the card after success', async () => {
  const view = render(<MyReservationsScreen />);
  await waitFor(() => expect(view.getByText('Lavado exterior')).toBeTruthy());

  fireEvent.press(view.getByRole('button', { name: 'mobile.reservations.cancelTitle: Lavado exterior' }));
  expect(mockCancel).not.toHaveBeenCalled();
  expect(view.getByText('mobile.reservations.cancelQuestion')).toBeTruthy();
  fireEvent.press(view.getByRole('button', { name: 'mobile.reservations.yesCancel' }));

  await waitFor(() => expect(mockCancel).toHaveBeenCalledWith('reservation-1'));
  await waitFor(() => expect(mockAlert).toHaveBeenCalledWith(
    'mobile.reservations.cancelledTitle',
    'mobile.reservations.cancelledMessage',
    undefined,
    'success',
  ));
  expect(view.queryByRole('button', { name: 'mobile.reservations.cancelTitle: Lavado exterior' })).toBeNull();
});

test('shows a safe cancellation error and leaves the reservation available', async () => {
  mockCancel.mockRejectedValueOnce({ response: { status: 503 } });
  const view = render(<MyReservationsScreen />);
  await waitFor(() => expect(view.getByText('Lavado exterior')).toBeTruthy());

  fireEvent.press(view.getByRole('button', { name: 'mobile.reservations.cancelTitle: Lavado exterior' }));
  fireEvent.press(view.getByRole('button', { name: 'mobile.reservations.yesCancel' }));

  await waitFor(() => expect(mockAlert).toHaveBeenCalledWith(
    'mobile.reservations.cancelErrorTitle',
    'apiErrors.server_unavailable',
    undefined,
    'error',
  ));
  expect(view.getByText('Lavado exterior')).toBeTruthy();
  expect(mockCancel).toHaveBeenCalledTimes(1);
});

test('sends only one cancellation request for repeated confirmation presses', async () => {
  let resolveCancellation: (value: ReservationResponse) => void = () => {};
  mockCancel.mockReturnValue(new Promise<ReservationResponse>((resolve) => {
    resolveCancellation = resolve;
  }));
  const view = render(<MyReservationsScreen />);
  await waitFor(() => expect(view.getByText('Lavado exterior')).toBeTruthy());

  fireEvent.press(view.getByRole('button', { name: 'mobile.reservations.cancelTitle: Lavado exterior' }));
  const confirm = view.getByRole('button', { name: 'mobile.reservations.yesCancel' });
  act(() => {
    fireEvent.press(confirm);
    fireEvent.press(confirm);
  });

  expect(mockCancel).toHaveBeenCalledTimes(1);
  await act(async () => resolveCancellation({ ...reservation, estado: 'CANCELADA' }));
  expect(mockAlert).toHaveBeenCalledTimes(1);
});
