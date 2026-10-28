import React from 'react';
import { act, fireEvent, render, waitFor, within } from '@testing-library/react-native';

import ServiceDetailsScreen from './ServiceDetailsScreen';
import { paymentService } from '../../../services/paymentService';
import { reservationService } from '../../reservations/services/reservationService';

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

const reservation = {
  idReserva: 'reservation-1',
  idUsuario: 'user-1',
  idVehiculo: 'vehicle-1',
  idServicio: 'service-1',
  nombreUsuario: 'Test User',
  placaVehiculo: 'ABC123',
  tipoVehiculo: 'Carro',
  nombreServicio: 'Lavado completo',
  descripcionServicio: 'Servicio de prueba',
  precioServicio: 25000,
  duracionServicio: 60,
  fechaReserva: '2026-10-16',
  horaReserva: '10:00:00',
  fechaHoraInicio: null,
  fechaHoraFin: null,
  createdAt: '2026-10-15T12:00:00Z',
  updatedAt: '2026-10-15T12:00:00Z',
  estado: 'PENDIENTE' as const,
};

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (callback: () => void) => require('react').useEffect(callback, [callback]),
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => ({
      'mobile.serviceDetail.back': 'Volver',
      'mobile.reservationDetail.title': 'Detalle',
      'mobile.reservationDetail.serviceInfo': 'Información del servicio',
      'mobile.reservationDetail.description': 'Descripción del servicio',
      'mobile.reservationDetail.reservation': 'Reserva',
      'mobile.reservationDetail.date': 'Fecha',
      'mobile.reservationDetail.time': 'Hora',
      'mobile.reservationDetail.vehicle': 'Vehículo',
      'mobile.reservationDetail.plate': 'Placa',
      'mobile.reservationDetail.price': 'Precio',
      'mobile.reservationDetail.duration': 'Duración',
      'mobile.reservationDetail.minutes': 'minutos',
      'mobile.reservationDetail.processStatus': 'Estado del proceso',
      'mobile.reservationDetail.confirmed': 'Reserva confirmada',
      'mobile.reservationDetail.inService': 'Vehículo en servicio',
      'mobile.reservationDetail.finished': 'Servicio finalizado',
      'mobile.reservationDetail.status.pending': 'Pendiente',
      'mobile.services.serviceFallback': 'Servicio',
      'mobile.services.notAvailable': 'No disponible',
      'mobile.paymentFlow.status': 'Estado del pago',
      'mobile.paymentFlow.retryPayment': 'Reintentar pago',
      'mobile.paymentFlow.payNow': 'Pagar ahora',
      'mobile.paymentFlow.processingPreviousPayment': 'Estamos confirmando tu pago anterior. Vuelve a intentarlo cuando termine la verificación para evitar un cobro duplicado.',
      'mobile.paymentFlow.approved': 'Pago aprobado',
      'mobile.paymentFlow.pendingHint': 'El pago sigue pendiente.',
      'mobile.paymentFlow.declined': 'Pago rechazado',
      'mobile.paymentFlow.error': 'No fue posible consultar el pago.',
      'mobile.paymentFlow.checkAgain': 'Consultar estado',
      'ratingFlow.rateService': 'Calificar servicio',
      'ratingFlow.loadError': 'No fue posible cargar la calificación.',
      'ratingFlow.alreadyRatedLabel': 'Ya calificado',
      'ratingFlow.success': 'Calificación enviada',
      'ratingFlow.question': '¿Cómo fue tu servicio?',
      'ratingFlow.close': 'Cerrar',
      'ratingFlow.title': 'Calificar',
      'ratingFlow.comment': 'Comentario',
      'ratingFlow.commentPlaceholder': 'Escribe un comentario',
      'ratingFlow.submit': 'Enviar',
      'ratingFlow.stars': 'Estrellas',
    }[key] ?? key),
  }),
}));
jest.mock('@expo/vector-icons', () => ({
  Ionicons: (props: any) => require('react').createElement(require('react-native').Text, props),
}));
jest.mock('../../../components/common/BackButton', () => ({
  __esModule: true,
  default: (props: any) => require('react').createElement(
    require('react-native').Pressable,
    { accessibilityRole: 'button', accessibilityLabel: props.accessibilityLabel, onPress: props.onPress },
  ),
}));
jest.mock('../../../theme/ThemeContext', () => ({
  ThemeContext: require('react').createContext({
    theme: {
      background: '#F7FBFF', card: '#FFFFFF', border: '#DDE4EF', text: '#0D1B3E',
      textSecondary: '#4A5568', primary: '#1565C0', primarySoft: '#E6F1FF',
      onPrimary: '#FFFFFF', success: '#16A34A', inProgress: '#0E7490',
      errorText: '#DC2626', inputBackground: '#F8FAFC', overlay: '#0008',
      warning: '#D97706',
    },
  }),
}));
jest.mock('../../../services/ratingService', () => ({
  ratingService: { getByReservation: jest.fn(), submit: jest.fn() },
}));
jest.mock('../../../utils/formatters', () => ({
  formatCurrency: (value: number) => `$${value}`,
}));
jest.mock('../../../services/paymentService', () => ({
  paymentService: { getByReservation: jest.fn(), verify: jest.fn() },
}));
jest.mock('../../reservations/services/reservationService', () => ({
  reservationService: { getById: jest.fn() },
}));

const renderDetails = () => render(
  <ServiceDetailsScreen
    route={{ params: { reservation } } as any}
    navigation={{ navigate: mockNavigate, goBack: mockGoBack } as any}
  />,
);

test('renders the service description in its own card beneath the reservation summary', () => {
  const view = renderDetails();
  const description = view.getByTestId('reservation-description');
  const content = view.getByTestId('service-title-description');
  const descriptionCard = view.getByTestId('reservation-description-card');
  expect(view.getAllByText('Servicio de prueba')).toHaveLength(1);
  expect(view.getByText('Descripción del servicio')).toBeTruthy();
  expect(view.getByText('Servicio de prueba').props.numberOfLines).toBeUndefined();
  expect(description.props.style).toEqual(expect.arrayContaining([
    expect.objectContaining({ color: '#4A5568' }),
  ]));
  expect(within(content).getByTestId('service-name-title')).toBeTruthy();
  expect(within(content).queryByTestId('reservation-description')).toBeNull();
  expect(within(descriptionCard).getByTestId('reservation-description')).toBeTruthy();
  expect(view.queryByText(/Reserva #/)).toBeNull();
});

beforeEach(() => {
  jest.clearAllMocks();
  (reservationService.getById as jest.Mock).mockResolvedValue(reservation);
  (paymentService.getByReservation as jest.Mock).mockResolvedValue({ estado: 'rechazado' });
});

test('shows Pagar ahora for a pending reservation with a rejected payment', async () => {
  const view = renderDetails();

  await waitFor(() => expect(view.getByRole('button', { name: 'Pagar ahora' })).toBeTruthy());
  fireEvent.press(view.getByRole('button', { name: 'Pagar ahora' }));

  expect(mockNavigate).toHaveBeenCalledWith('ReservationPayment', { reservation, autoStart: true });
});

test('does not show retry payment when the backend reports an approved payment', async () => {
  (paymentService.getByReservation as jest.Mock).mockResolvedValue({ estado: 'aprobado' });
  const view = renderDetails();

  await waitFor(() => expect(view.getByText('Pago aprobado')).toBeTruthy());
  expect(view.queryByRole('button', { name: 'Pagar ahora' })).toBeNull();
});

test('offers Pagar ahora for a pending attempt and does not require a manual status button', async () => {
  (paymentService.getByReservation as jest.Mock).mockResolvedValue({ estado: 'pendiente' });
  const view = renderDetails();

  await waitFor(() => expect(view.getByText('El pago sigue pendiente.')).toBeTruthy());
  expect(view.getByRole('button', { name: 'Pagar ahora' })).toBeTruthy();
  expect(view.queryByRole('button', { name: 'Consultar estado' })).toBeNull();
});

test('automatically verifies a pending Wompi transaction and keeps Pagar ahora available while it processes', async () => {
  const pendingPayment = {
    estado: 'pendiente',
    intentoActual: { referencia: 'ref-1', wompiTransactionId: 'txn-1', wompiStatus: 'PENDING', estado: 'pendiente' },
  };
  (paymentService.getByReservation as jest.Mock).mockResolvedValue(pendingPayment);
  (paymentService.verify as jest.Mock).mockResolvedValue(pendingPayment);
  const view = renderDetails();

  await waitFor(() => expect(paymentService.verify).toHaveBeenCalledWith('reservation-1', 'ref-1', 'txn-1'));
  expect(view.getByText('Estamos confirmando tu pago anterior. Vuelve a intentarlo cuando termine la verificación para evitar un cobro duplicado.')).toBeTruthy();
  expect(view.getByRole('button', { name: 'Pagar ahora' })).toBeTruthy();
});

test('keeps the payment spinner centered inside its card during status loading', async () => {
  let resolvePayment: (value: unknown) => void = () => {};
  (paymentService.getByReservation as jest.Mock).mockReturnValue(new Promise(resolve => { resolvePayment = resolve; }));
  const view = renderDetails();

  await waitFor(() => expect(view.getByTestId('payment-loading-container')).toBeTruthy());
  await waitFor(() => expect(paymentService.getByReservation).toHaveBeenCalled());
  expect(view.getByTestId('payment-loading-container').props.style).toEqual(expect.objectContaining({
    minHeight: 96,
    alignItems: 'center',
    justifyContent: 'center',
  }));
  await act(async () => resolvePayment({ estado: 'pendiente' }));
});

test('reuses the same navigation action on a double press', async () => {
  const view = renderDetails();
  await waitFor(() => expect(view.getByRole('button', { name: 'Pagar ahora' })).toBeTruthy());

  await act(async () => {
    fireEvent.press(view.getByRole('button', { name: 'Pagar ahora' }));
    fireEvent.press(view.getByRole('button', { name: 'Pagar ahora' }));
  });

  expect(mockNavigate).toHaveBeenCalledTimes(1);
});

test('keeps Pagar ahora available after a status lookup error; the payment screen rechecks before starting', async () => {
  (paymentService.getByReservation as jest.Mock).mockRejectedValue(new Error('network'));
  const view = renderDetails();

  await waitFor(() => expect(view.getByText('No fue posible consultar el pago.')).toBeTruthy());
  expect(view.getByRole('button', { name: 'Pagar ahora' })).toBeTruthy();
  expect(view.queryByRole('button', { name: 'Consultar estado' })).toBeNull();
});

test('allows starting payment only when payment lookup confirms no payment exists', async () => {
  (paymentService.getByReservation as jest.Mock).mockRejectedValue({ response: { status: 404 } });
  const view = renderDetails();
  await waitFor(() => expect(view.getByRole('button', { name: 'Pagar ahora' })).toBeTruthy());
});

test('does not offer retry when the latest reservation is no longer pending', async () => {
  (reservationService.getById as jest.Mock).mockResolvedValue({ ...reservation, estado: 'ASIGNADA' });
  const view = renderDetails();
  await waitFor(() => expect(view.queryByRole('button', { name: 'Pagar ahora' })).toBeNull());
  expect(paymentService.getByReservation).not.toHaveBeenCalled();
});

