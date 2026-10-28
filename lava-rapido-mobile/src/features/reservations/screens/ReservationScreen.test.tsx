/// <reference types="jest" />
import React from 'react';
import es from '../../../i18n/locales/es.json';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import ReservationScreen from './ReservationScreen';
import { reservationService } from '../services/reservationService';
import { vehicleService } from '../../vehicles/services/vehicleService';
import { serviceService } from '../../../services/serviceService';

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockNavigation = { navigate: mockNavigate, goBack: mockGoBack };
const mockTranslate = (key: string) => {
  if (key === 'language.close') return 'Cerrar';
  if (key === 'legal.terms.title') return es.legal.terms.title;
  if (key === 'legal.terms.intro') return es.legal.terms.intro;
  if (key === 'legal.paymentInterruption.title') return es.legal.paymentInterruption.title;
  if (key === 'legal.paymentInterruption.body') return es.legal.paymentInterruption.body;
  const match = key.match(/^legal\.terms\.sections\.([^.]+)\.(title|body)$/);
  return match ? es.legal.terms.sections[match[1] as keyof typeof es.legal.terms.sections][match[2] as 'title' | 'body'] : key;
};
const mockService = {
  idServicio: 'service-1',
  nombre: 'Lavado',
  descripcion: null,
  precio: 25000,
  duracionMinutos: 60,
  estado: true,
  createdAt: '',
  updatedAt: '',
};
let mockRouteService: typeof mockService | undefined = mockService;

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (callback: () => void) => require('react').useEffect(callback, [callback]),
  useNavigation: () => mockNavigation,
  useRoute: () => ({ params: { service: mockRouteService } }),
}));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: mockTranslate }) }));
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
jest.mock('@react-native-community/datetimepicker', () => {
  const ReactModule = require('react');
  const { Pressable, Text } = require('react-native');
  return {
    __esModule: true,
    default: ({ onChange }: { onChange: (event: unknown, date: Date) => void }) =>
      ReactModule.createElement(
        Pressable,
        {
          accessibilityRole: 'button',
          accessibilityLabel: 'choose-future-date',
          onPress: () => onChange({}, new Date(Date.now() + 86400000)),
        },
        ReactModule.createElement(Text, null, 'Choose future date'),
      ),
  };
});
jest.mock('@react-native-picker/picker', () => {
  const ReactModule = require('react');
  const { View } = require('react-native');
  const Picker = Object.assign(
    ({ children }: { children: React.ReactNode }) =>
      ReactModule.createElement(View, null, children),
    { Item: () => null },
  );
  return { Picker };
});
jest.mock('../../../components/common/BackButton', () => ({ __esModule: true, default: () => null }));
jest.mock('../../../components/notifications/NotificationProvider', () => ({
  appAlert: { alert: jest.fn() },
}));
jest.mock('../../../theme/ThemeContext', () => ({
  ThemeContext: require('react').createContext({
    darkMode: false,
    theme: {
      background: '#fff', card: '#fff', text: '#000', textSecondary: '#555',
      border: '#ddd', primary: '#00f', inputBackground: '#fff', errorText: '#f00',
      success: '#0f0', primarySoft: '#eef', onPrimary: '#fff',
    },
  }),
}));
jest.mock('../../vehicles/services/vehicleService', () => ({
  vehicleService: { getMyVehicles: jest.fn() },
}));
jest.mock('../../../services/serviceService', () => ({
  serviceService: { getById: jest.fn() },
}));
jest.mock('../services/reservationService', () => ({
  reservationService: { create: jest.fn() },
}));

const mockAlert = jest.requireMock('../../../components/notifications/NotificationProvider').appAlert.alert as jest.Mock;
const vehicle = {
  idVehiculo: 'vehicle-1',
  estado: true,
  nombreMarca: 'Marca',
  placa: 'ABC123',
  tipoVehiculo: 'CARRO',
};
const createdReservation = {
  idReserva: 'reservation-1',
  fechaReserva: '2026-10-16',
  horaReserva: '12:00:00',
  estado: 'PENDIENTE',
};

function axiosError(status: number, data: unknown = {}) {
  return Object.assign(new Error('request failed'), {
    isAxiosError: true,
    response: { status, data },
  });
}

async function renderReservation() {
  const view = render(<ReservationScreen />);
  await waitFor(() => expect(vehicleService.getMyVehicles).toHaveBeenCalledTimes(1));
  const vehicleRequest = (vehicleService.getMyVehicles as jest.Mock).mock.results.at(-1)?.value;
  await act(async () => {
    await vehicleRequest;
  });
  return view;
}

async function selectFutureDate(view: ReturnType<typeof render>) {
  fireEvent.press(view.getByLabelText(/^mobile\.reservation\.reservationDate/));
  fireEvent.press(view.getByLabelText('choose-future-date'));
}

beforeEach(() => {
  jest.clearAllMocks();
  mockRouteService = mockService;
  (vehicleService.getMyVehicles as jest.Mock).mockResolvedValue([vehicle]);
  (serviceService.getById as jest.Mock).mockResolvedValue(mockService);
  (reservationService.create as jest.Mock).mockResolvedValue(createdReservation);
});

test('crea una reserva válida y navega al flujo de pago', async () => {
  const view = await renderReservation();
  const confirm = view.getByText('mobile.reservation.confirm');
  await selectFutureDate(view);
  fireEvent.press(confirm);

  await waitFor(() => expect(reservationService.create).toHaveBeenCalledTimes(1));
  expect(serviceService.getById).toHaveBeenCalledTimes(1);
  expect(serviceService.getById).toHaveBeenCalledWith('service-1');
  expect(vehicleService.getMyVehicles).toHaveBeenCalledTimes(2);
  expect(reservationService.create).toHaveBeenCalledWith({
    fkIdVehiculo: 'vehicle-1',
    fkIdServicio: 'service-1',
    fechaReserva: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
    horaReserva: '08:00:00',
  });
  expect(mockNavigate).toHaveBeenCalledWith('ReservationPayment', {
    reservation: createdReservation,
  });
});

test('permite seleccionar el vehiculo completo como una tarjeta accesible', async () => {
  const secondVehicle = {
    ...vehicle,
    idVehiculo: 'vehicle-2',
    nombreMarca: 'Otra marca',
    placa: 'XYZ789',
    tipoVehiculo: 'MOTO',
  };
  (vehicleService.getMyVehicles as jest.Mock).mockResolvedValue([vehicle, secondVehicle]);

  const view = await renderReservation();
  const secondCard = view.getByRole('radio', { name: 'Otra marca XYZ789' });

  expect(view.getByRole('radio', { name: 'Marca ABC123' }).props.accessibilityState.selected).toBe(true);
  fireEvent.press(secondCard);

  expect(secondCard.props.accessibilityState.selected).toBe(true);
});

test('valida que exista un servicio antes de crear una reserva', async () => {
  mockRouteService = undefined;
  const view = await renderReservation();
  const confirm = view.getByText('mobile.reservation.confirm');
  await selectFutureDate(view);
  fireEvent.press(confirm);

  expect(mockAlert).toHaveBeenCalledWith(
    'mobile.reservation.error',
    'mobile.reservation.serviceMissing',
    undefined,
    'error',
  );
  expect(reservationService.create).not.toHaveBeenCalled();
});

test('shows cancellation terms before reservation confirmation', async () => {
  const view = await renderReservation();

  expect(view.getByText('mobile.reservation.cancellationPolicySummary')).toBeTruthy();
  fireEvent.press(view.getByRole('link', { name: 'mobile.reservation.readCancellationPolicy' }));

  expect(view.getByText('Términos y condiciones')).toBeTruthy();
  expect(view.getByText('6. Cancelación voluntaria')).toBeTruthy();
  expect(reservationService.create).not.toHaveBeenCalled();
});

test('no permite continuar sin vehículos activos', async () => {
  (vehicleService.getMyVehicles as jest.Mock).mockResolvedValue([]);
  const view = await renderReservation();
  await view.findByText('mobile.reservation.noVehicles');

  expect(view.getByRole('button', { name: 'mobile.reservation.confirm' }).props.accessibilityState.disabled).toBe(true);
  expect(reservationService.create).not.toHaveBeenCalled();
});

test('shows a retryable error when vehicle loading fails', async () => {
  (vehicleService.getMyVehicles as jest.Mock).mockReset();
  (vehicleService.getMyVehicles as jest.Mock)
    .mockRejectedValueOnce(new Error('network failure'))
    .mockResolvedValueOnce([vehicle]);

  const view = render(<ReservationScreen />);

  await waitFor(() => expect(view.getByText('mobile.reservation.vehicleLoadError')).toBeTruthy());
  expect(view.queryByText('mobile.reservation.noVehicles')).toBeNull();

  fireEvent.press(view.getByRole('button', { name: 'common.retry' }));

  await waitFor(() => expect(vehicleService.getMyVehicles).toHaveBeenCalledTimes(2));
  await waitFor(() => expect(view.getByRole('radio', { name: 'Marca ABC123' })).toBeTruthy());
});

test('does not start duplicate vehicle loads from repeated retry presses', async () => {
  let finishRetry: (value: typeof vehicle[]) => void = () => {};
  (vehicleService.getMyVehicles as jest.Mock).mockReset();
  (vehicleService.getMyVehicles as jest.Mock)
    .mockRejectedValueOnce(new Error('network failure'))
    .mockImplementationOnce(() => new Promise((resolve) => { finishRetry = resolve; }));

  const view = render(<ReservationScreen />);
  await waitFor(() => expect(view.getByText('mobile.reservation.vehicleLoadError')).toBeTruthy());

  const retry = view.getByRole('button', { name: 'common.retry' });
  act(() => {
    fireEvent.press(retry);
    fireEvent.press(retry);
  });

  expect(vehicleService.getMyVehicles).toHaveBeenCalledTimes(2);

  await act(async () => finishRetry([vehicle]));
  await waitFor(() => expect(view.getByRole('radio', { name: 'Marca ABC123' })).toBeTruthy());
});

test('ignora doble pulsación mientras se procesa el envío', async () => {
  let finishCreate: (value: typeof createdReservation) => void = () => {};
  (reservationService.create as jest.Mock).mockImplementation(
    () => new Promise((resolve) => { finishCreate = resolve; }),
  );
  const view = await renderReservation();
  const confirm = view.getByRole('button', { name: 'mobile.reservation.confirm' });
  await selectFutureDate(view);

  act(() => {
    fireEvent.press(confirm);
    fireEvent.press(confirm);
  });
  await waitFor(() => expect(reservationService.create).toHaveBeenCalledTimes(1));

  await act(async () => finishCreate(createdReservation));
  expect(mockNavigate).toHaveBeenCalledTimes(1);
});

test.each([
  [409, {}, 'mobile.reservation.createErrorTitle'],
  [400, { error: 'Horario o estado de reserva invalido' }, 'mobile.reservation.overlapTitle'],
  [400, { error: 'Solicitud invalida' }, 'mobile.reservation.invalidData'],
  [401, {}, 'mobile.reservation.expiredTitle'],
  [500, {}, 'mobile.reservation.serverTitle'],
])('presenta un mensaje seguro para HTTP %s', async (status, data, title) => {
  (reservationService.create as jest.Mock).mockRejectedValue(axiosError(status, data));
  const view = await renderReservation();
  const confirm = view.getByText('mobile.reservation.confirm');
  await selectFutureDate(view);
  fireEvent.press(confirm);

  await waitFor(() => expect(mockAlert.mock.calls.at(-1)?.[0]).toBe(title));
  expect(mockAlert.mock.calls.at(-1)?.[1]).toEqual(expect.any(String));
  expect(mockAlert.mock.calls.flat().join(' ')).not.toContain('request failed');
});

test.each([
  ['timeout', Object.assign(new Error('timeout'), { isAxiosError: true, code: 'ECONNABORTED' }), 'apiErrors.timeout'],
  ['network loss', Object.assign(new Error('offline'), { isAxiosError: true, code: 'ERR_NETWORK' }), 'apiErrors.network'],
])('handles %s without retrying creation automatically', async (_label, error, messageKey) => {
  (reservationService.create as jest.Mock).mockRejectedValue(error);
  const view = await renderReservation();
  const confirm = view.getByText('mobile.reservation.confirm');
  await selectFutureDate(view);
  fireEvent.press(confirm);

  await waitFor(() => expect(mockAlert).toHaveBeenCalledWith(
    'mobile.reservation.createErrorTitle',
    messageKey,
    undefined,
    'error',
  ));
  expect(reservationService.create).toHaveBeenCalledTimes(1);
});
