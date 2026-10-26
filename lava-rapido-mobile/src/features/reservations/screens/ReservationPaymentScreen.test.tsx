/// <reference types="jest" />
import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import ReservationPaymentScreen from './ReservationPaymentScreen';
import { paymentService } from '../../../services/paymentService';
import { reservationService } from '../services/reservationService';

const mockNavigate = jest.fn();
const mockDispatch = jest.fn();
const mockGoBack = jest.fn();
const mockUsePreventRemove = jest.fn();
const mockAppAlert = jest.fn();
const mockCopy: Record<string, string> = {
  'mobile.paymentFlow.approvedTitle': 'Pago aprobado',
  'mobile.paymentFlow.approvedMessage': 'Tu pago fue confirmado.',
  'mobile.paymentFlow.myServices': 'Ver mis servicios',
  'mobile.paymentFlow.goHome': 'Volver al inicio',
  'mobile.paymentFlow.pending': 'Pendiente de confirmación',
  'mobile.paymentFlow.declined': 'Pago rechazado',
  'mobile.paymentFlow.retryPayment': 'Reintentar pago',
  'mobile.paymentFlow.acceptAndContinue': 'Acepto la política y continuar',
  'mobile.paymentFlow.acceptAndRetry': 'Acepto la política y reintentar pago',
  'mobile.paymentFlow.policySummary': 'Condiciones de cancelación antes de pagar.',
  'mobile.paymentFlow.policyVersion': 'Versión de la política: 2026-10-26',
  'mobile.reservation.readCancellationPolicy': 'Leer política de cancelación y devoluciones',
  'mobile.paymentFlow.error': 'Error de pago',
  'mobile.paymentFlow.startError': 'Error al iniciar el pago',
  'mobile.paymentFlow.duplicateHint': 'Requiere revisión',
  'mobile.paymentFlow.duplicateApproval': 'Posible cobro duplicado',
  'mobile.paymentFlow.exitTitle': '¿Salir del pago?',
  'mobile.paymentFlow.exitMessage': 'Si sales ahora, se intentará cancelar tu reserva pendiente. ¿Deseas continuar?',
  'mobile.paymentFlow.exitAndCancel': 'Salir y cancelar reserva',
  'mobile.paymentFlow.continuePaying': 'Seguir pagando',
  'mobile.paymentFlow.cancellingReservation': 'Cancelando reserva…',
  'mobile.paymentFlow.cancelledTitle': 'Reserva cancelada',
  'mobile.paymentFlow.cancelledMessage': 'Tu reserva se canceló correctamente.',
  'mobile.paymentFlow.alreadyCancelledTitle': 'Reserva ya cancelada',
  'mobile.paymentFlow.alreadyCancelledMessage': 'La reserva ya estaba cancelada.',
  'mobile.paymentFlow.pendingCancellationTitle': 'Pago pendiente',
  'mobile.paymentFlow.pendingCancellationMessage': 'Tu pago todavía está pendiente de confirmación. Por seguridad, la reserva no se ha cancelado.',
  'mobile.paymentFlow.approvedExitTitle': 'Pago confirmado',
  'mobile.paymentFlow.approvedExitMessage': 'El pago ya fue aprobado. Tu reserva no puede cancelarse desde esta pantalla.',
  'mobile.paymentFlow.viewReservations': 'Consultar reserva',
  'mobile.paymentFlow.cancellationDeniedTitle': 'No se pudo cancelar',
  'mobile.paymentFlow.cancellationDeniedMessage': 'No tienes autorización para cancelar esta reserva. Consulta tus reservas.',
  'mobile.paymentFlow.reservationNotFoundTitle': 'Reserva no encontrada',
  'mobile.paymentFlow.reservationNotFoundMessage': 'No pudimos encontrar esta reserva. Consulta tus reservas.',
  'mobile.paymentFlow.cancelUnknownTitle': 'No pudimos confirmar el estado',
  'mobile.paymentFlow.cancelUnknownMessage': 'No se pudo confirmar el estado de la cancelación. Consulta tus reservas antes de continuar.',
  'mobile.paymentFlow.notPendingCancellationTitle': 'Reserva no cancelable',
  'mobile.paymentFlow.notPendingCancellationMessage': 'La reserva ya no está pendiente y no puede cancelarse por esta opción.',
};

jest.mock('@react-navigation/native', () => ({
  CommonActions: {
    navigate: (name: string, params: unknown) => ({
      type: 'NAVIGATE',
      payload: { name, params },
    }),
  },
  useFocusEffect: (callback: () => void) => require('react').useEffect(callback, [callback]),
  UNSTABLE_usePreventRemove: (...args: unknown[]) => mockUsePreventRemove(...args),
}));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => mockCopy[key] ?? key }) }));
jest.mock('@expo/vector-icons', () => ({ Ionicons: (props: any) => require('react').createElement(require('react-native').Text, props) }));
jest.mock('react-native-webview', () => ({ WebView: (props: any) => require('react').createElement(require('react-native').View, props) }));
jest.mock('../../../components/common/BackButton', () => ({
  __esModule: true,
  default: (props: any) => require('react').createElement(
    require('react-native').Pressable,
    { accessibilityRole: 'button', accessibilityLabel: props.accessibilityLabel, onPress: props.onPress },
  ),
}));
jest.mock('../../../components/notifications/ConfirmationModal', () => ({
  __esModule: true,
  default: (props: any) => props.visible ? require('react').createElement(
    require('react-native').View,
    {},
    require('react').createElement(require('react-native').Text, {}, props.title),
    require('react').createElement(require('react-native').Text, {}, props.message),
    ...(props.busy
      ? [require('react').createElement(require('react-native').Text, {}, props.busyLabel)]
      : [
        [props.confirmLabel, props.onConfirm],
        [props.cancelLabel, props.onCancel],
      ].map(([label, onPress]) => require('react').createElement(
        require('react-native').Pressable,
        { key: label, accessibilityRole: 'button', accessibilityLabel: label, onPress },
        require('react').createElement(require('react-native').Text, {}, label),
      ))),
  ) : null,
}));
jest.mock('../../../components/notifications/NotificationProvider', () => ({
  appAlert: { alert: (...args: unknown[]) => mockAppAlert(...args) },
}));
jest.mock('../../../theme/ThemeContext', () => ({
  ThemeContext: require('react').createContext({
    theme: {
      background: '#F7FBFF',
      card: '#FFFFFF',
      border: '#DDE4EF',
      text: '#0D1B3E',
      textSecondary: '#4A5568',
      primary: '#1565C0',
      primarySoft: '#E6F1FF',
      onPrimary: '#FFFFFF',
      success: '#16A34A',
      successBackground: '#16A34A12',
      errorText: '#DC2626',
    },
  }),
}));
jest.mock('../../../services/paymentService', () => ({
  paymentService: { getByReservation: jest.fn(), start: jest.fn(), verify: jest.fn() },
}));
jest.mock('../services/reservationService', () => ({
  getReservationCancellationFailure: (error: { response?: { status?: number; data?: { code?: string } } }) => ({
    status: error?.response?.status,
    code: error?.response?.data?.code,
  }),
  reservationService: { cancelForCheckout: jest.fn() },
}));

const reservation = { idReserva: 'res-1', idUsuario: 'user-1' };
const payment = (estado: 'aprobado' | 'rechazado' | 'pendiente', intentoEstado: string = estado) => ({
  idPago: 'pay-1',
  idReserva: 'res-1',
  estado,
  intentoActual: { estado: intentoEstado },
  intentos: [],
});
const exitAction = { type: 'GO_BACK' };
const renderPayment = () => render(
  <ReservationPaymentScreen
    route={{ params: { reservation } } as any}
    navigation={{ navigate: mockNavigate, dispatch: mockDispatch, goBack: mockGoBack } as any}
  />,
);
const triggerRemoval = (action = exitAction) => {
  const call = mockUsePreventRemove.mock.calls[mockUsePreventRemove.mock.calls.length - 1];
  act(() => call?.[1]({ data: { action } }));
};
const confirmCancellation = (view: ReturnType<typeof render>) => {
  fireEvent.press(view.getByRole('button', { name: 'Salir y cancelar reserva' }));
};
const beginCheckout = async (view: ReturnType<typeof render>) => {
  await waitFor(() => expect(view.getByRole('button', { name: 'Acepto la política y continuar' })).toBeTruthy());
  fireEvent.press(view.getByRole('button', { name: 'Acepto la política y continuar' }));
  await waitFor(() => expect(paymentService.start).toHaveBeenCalledTimes(1));
};
const navigationAction = (status: string) => expect.objectContaining({
  type: 'NAVIGATE',
  payload: {
    name: 'MainTabs',
    params: { screen: 'Mis servicios', params: { initialStatus: status } },
  },
});

beforeEach(() => {
  jest.clearAllMocks();
  mockGoBack.mockImplementation(() => triggerRemoval());
  (paymentService.start as jest.Mock).mockResolvedValue({ referencia: 'ref-1' });
  (paymentService.getByReservation as jest.Mock).mockResolvedValue(payment('pendiente'));
});

test('does not start Wompi until the user explicitly accepts the policy', async () => {
  (paymentService.getByReservation as jest.Mock).mockRejectedValue({ response: { status: 404 } });
  const view = renderPayment();

  await waitFor(() => expect(view.getByText('Condiciones de cancelación antes de pagar.')).toBeTruthy());
  expect(view.getByText('Versión de la política: 2026-10-26')).toBeTruthy();
  expect(paymentService.start).not.toHaveBeenCalled();

  await beginCheckout(view);
});

test('opens the full cancellation terms before starting Wompi', async () => {
  const view = renderPayment();
  await waitFor(() => expect(view.getByRole('link', { name: 'Leer política de cancelación y devoluciones' })).toBeTruthy());

  fireEvent.press(view.getByRole('link', { name: 'Leer política de cancelación y devoluciones' }));

  expect(view.getByText('Términos y condiciones')).toBeTruthy();
  expect(view.getByText('6. Cancelación voluntaria')).toBeTruthy();
  expect(paymentService.start).not.toHaveBeenCalled();
});

test('pago aprobado conserva la navegación existente a Mis servicios', async () => {
  (paymentService.getByReservation as jest.Mock).mockResolvedValue(payment('aprobado'));
  const view = renderPayment();
  await waitFor(() => expect(view.getByText('Ver mis servicios')).toBeTruthy());

  fireEvent.press(view.getByText('Ver mis servicios'));

  expect(mockNavigate).toHaveBeenCalledWith('MainTabs', {
    screen: 'Mis servicios',
    params: { initialStatus: 'PENDIENTE' },
  });
  expect(paymentService.start).not.toHaveBeenCalled();
});

test.each(['pendiente', 'rechazado'] as const)('pago %s no presenta confirmación exitosa', async (estado) => {
  (paymentService.getByReservation as jest.Mock).mockResolvedValue(payment(estado));
  const view = renderPayment();
  await waitFor(() => expect(paymentService.getByReservation).toHaveBeenCalled());
  await waitFor(() => expect(view.queryByText('mobile.paymentFlow.processing')).toBeNull());
  expect(view.queryByText('Ver mis servicios')).toBeNull();
  expect(reservationService.cancelForCheckout).not.toHaveBeenCalled();
});

test('seguir pagando cierra la confirmación sin solicitar cancelación ni navegar', async () => {
  const view = renderPayment();
  await beginCheckout(view);

  fireEvent.press(view.getByLabelText('mobile.serviceDetail.back'));
  expect(view.getByText('¿Salir del pago?')).toBeTruthy();
  fireEvent.press(view.getByRole('button', { name: 'Seguir pagando' }));

  expect(view.queryByText('¿Salir del pago?')).toBeNull();
  expect(reservationService.cancelForCheckout).not.toHaveBeenCalled();
  expect(mockDispatch).not.toHaveBeenCalled();
});

test.each([
  ['Android back', { type: 'GO_BACK' }],
  ['gesture removal', { type: 'POP' }],
])('%s muestra confirmación antes de salir', async (_source, action) => {
  const view = renderPayment();
  await beginCheckout(view);

  triggerRemoval(action);

  expect(view.getByText('¿Salir del pago?')).toBeTruthy();
  expect(view.queryByText('Salir y cancelar reserva')).toBeTruthy();
  expect(reservationService.cancelForCheckout).not.toHaveBeenCalled();
});

test('confirma cancelación, muestra éxito y abre la lista para recargar reservas canceladas', async () => {
  (reservationService.cancelForCheckout as jest.Mock).mockResolvedValue({
    result: 'CANCELLED',
    reservation: { idReserva: 'res-1', estado: 'CANCELADA' },
  });
  const view = renderPayment();
  await beginCheckout(view);
  fireEvent.press(view.getByLabelText('mobile.serviceDetail.back'));

  confirmCancellation(view);

  await waitFor(() => expect(reservationService.cancelForCheckout).toHaveBeenCalledTimes(1));
  expect(reservationService.cancelForCheckout).toHaveBeenCalledWith('res-1', {
    policyAccepted: true,
    policyVersion: '2026-10-26',
  });
  expect(mockAppAlert).toHaveBeenCalledWith(
    'Reserva cancelada',
    'Tu reserva se canceló correctamente.',
    undefined,
    'success',
  );
  await waitFor(() => expect(mockDispatch).toHaveBeenCalledWith(navigationAction('CANCELADA')));
});

test('reserva ya cancelada informa el resultado sin repetir operaciones', async () => {
  (reservationService.cancelForCheckout as jest.Mock).mockResolvedValue({
    result: 'ALREADY_CANCELLED',
    reservation: { idReserva: 'res-1', estado: 'CANCELADA' },
  });
  const view = renderPayment();
  await beginCheckout(view);
  fireEvent.press(view.getByLabelText('mobile.serviceDetail.back'));
  confirmCancellation(view);

  await waitFor(() => expect(mockAppAlert).toHaveBeenCalledWith(
    'Reserva ya cancelada',
    'La reserva ya estaba cancelada.',
    undefined,
    'info',
  ));
  await waitFor(() => expect(mockDispatch).toHaveBeenCalledWith(navigationAction('CANCELADA')));
});

test('pago pendiente no confirma cancelación y permite seguir pagando o consultar la reserva', async () => {
  (reservationService.cancelForCheckout as jest.Mock).mockRejectedValue({
    response: { status: 409, data: { code: 'PAGO_PENDIENTE' } },
  });
  const view = renderPayment();
  await beginCheckout(view);
  fireEvent.press(view.getByLabelText('mobile.serviceDetail.back'));
  confirmCancellation(view);

  await waitFor(() => expect(mockAppAlert).toHaveBeenCalledWith(
    'Pago pendiente',
    'Tu pago todavía está pendiente de confirmación. Por seguridad, la reserva no se ha cancelado.',
    expect.any(Array),
    'warning',
  ));
  const buttons = mockAppAlert.mock.calls[0][2] as Array<{ text: string; onPress?: () => void }>;
  expect(buttons.map(button => button.text)).toEqual(['Consultar reserva', 'Seguir pagando']);
  act(() => buttons[1].onPress?.());
  expect(mockDispatch).not.toHaveBeenCalled();
  act(() => buttons[0].onPress?.());
  await waitFor(() => expect(mockDispatch).toHaveBeenCalledWith(navigationAction('PENDIENTE')));
  expect(mockAppAlert).not.toHaveBeenCalledWith('Reserva cancelada', expect.anything(), expect.anything(), 'success');
});

test('pago aprobado bloquea cancelación y dirige a consultar el estado actualizado', async () => {
  (reservationService.cancelForCheckout as jest.Mock).mockRejectedValue({
    response: { status: 409, data: { code: 'PAGO_APROBADO' } },
  });
  const view = renderPayment();
  await beginCheckout(view);
  fireEvent.press(view.getByLabelText('mobile.serviceDetail.back'));
  confirmCancellation(view);

  await waitFor(() => expect(mockAppAlert).toHaveBeenCalledWith(
    'Pago confirmado',
    'El pago ya fue aprobado. Tu reserva no puede cancelarse desde esta pantalla.',
    expect.any(Array),
    'info',
  ));
  const buttons = mockAppAlert.mock.calls[0][2] as Array<{ onPress?: () => void }>;
  act(() => buttons[0].onPress?.());
  await waitFor(() => expect(mockDispatch).toHaveBeenCalledWith(navigationAction('PENDIENTE')));
  expect(mockAppAlert).not.toHaveBeenCalledWith('Reserva cancelada', expect.anything(), expect.anything(), 'success');
});

test('si el pago ya figura aprobado localmente, ofrece consultar y nunca solicita cancelación', async () => {
  (paymentService.getByReservation as jest.Mock).mockResolvedValue(payment('aprobado'));
  const view = renderPayment();
  await waitFor(() => expect(view.getByText('Ver mis servicios')).toBeTruthy());
  fireEvent.press(view.getByLabelText('mobile.serviceDetail.back'));

  expect(view.getByText('Pago confirmado')).toBeTruthy();
  expect(view.queryByText('Salir y cancelar reserva')).toBeNull();
  fireEvent.press(view.getByRole('button', { name: 'Consultar reserva' }));

  await waitFor(() => expect(mockDispatch).toHaveBeenCalledWith(navigationAction('PENDIENTE')));
  expect(reservationService.cancelForCheckout).not.toHaveBeenCalled();
});

test.each([
  ['timeout', { code: 'ECONNABORTED' }],
  ['network failure', { code: 'ERR_NETWORK' }],
])('%s no se presenta como cancelación fallida ni exitosa y ofrece consultar', async (_kind, error) => {
  (reservationService.cancelForCheckout as jest.Mock).mockRejectedValue(error);
  const view = renderPayment();
  await beginCheckout(view);
  fireEvent.press(view.getByLabelText('mobile.serviceDetail.back'));
  confirmCancellation(view);

  await waitFor(() => expect(mockAppAlert).toHaveBeenCalledWith(
    'No pudimos confirmar el estado',
    'No se pudo confirmar el estado de la cancelación. Consulta tus reservas antes de continuar.',
    expect.any(Array),
    'warning',
  ));
  expect(mockAppAlert).not.toHaveBeenCalledWith('Reserva cancelada', expect.anything(), expect.anything(), 'success');
});

test('error HTTP 403 no se trata como cierre de sesión ni cancelación exitosa', async () => {
  (reservationService.cancelForCheckout as jest.Mock).mockRejectedValue({
    response: { status: 403, data: { error: 'internal detail' } },
  });
  const view = renderPayment();
  await beginCheckout(view);
  fireEvent.press(view.getByLabelText('mobile.serviceDetail.back'));
  confirmCancellation(view);

  await waitFor(() => expect(mockAppAlert).toHaveBeenCalledWith(
    'No se pudo cancelar',
    'No tienes autorización para cancelar esta reserva. Consulta tus reservas.',
    expect.any(Array),
    'error',
  ));
  expect(mockAppAlert).not.toHaveBeenCalledWith(expect.stringContaining('internal detail'), expect.anything(), expect.anything(), expect.anything());
});

test.each([
  [404, 'Reserva no encontrada', 'No pudimos encontrar esta reserva. Consulta tus reservas.'],
  [500, 'No pudimos confirmar el estado', 'No se pudo confirmar el estado de la cancelación. Consulta tus reservas antes de continuar.'],
])('HTTP %s no se presenta como cancelación confirmada', async (status, title, message) => {
  (reservationService.cancelForCheckout as jest.Mock).mockRejectedValue({
    response: { status, data: { error: 'internal detail' } },
  });
  const view = renderPayment();
  await beginCheckout(view);
  fireEvent.press(view.getByLabelText('mobile.serviceDetail.back'));
  confirmCancellation(view);

  await waitFor(() => expect(mockAppAlert).toHaveBeenCalledWith(
    title,
    message,
    expect.any(Array),
    'warning',
  ));
  expect(mockAppAlert).not.toHaveBeenCalledWith('Reserva cancelada', expect.anything(), expect.anything(), 'success');
  expect(mockAppAlert).not.toHaveBeenCalledWith(expect.stringContaining('internal detail'), expect.anything(), expect.anything(), expect.anything());
});

test('doble pulsación mientras se cancela solo envía una solicitud', async () => {
  let resolveCancellation!: (value: unknown) => void;
  (reservationService.cancelForCheckout as jest.Mock).mockReturnValue(new Promise(resolve => {
    resolveCancellation = resolve;
  }));
  const view = renderPayment();
  await beginCheckout(view);
  fireEvent.press(view.getByLabelText('mobile.serviceDetail.back'));
  const confirmButton = view.getByRole('button', { name: 'Salir y cancelar reserva' });

  fireEvent.press(confirmButton);
  fireEvent.press(confirmButton);

  await waitFor(() => expect(view.getByText('Cancelando reserva…')).toBeTruthy());
  expect(reservationService.cancelForCheckout).toHaveBeenCalledTimes(1);
  await act(async () => {
    resolveCancellation({
      result: 'CANCELLED',
      reservation: { idReserva: 'res-1', estado: 'CANCELADA' },
    });
  });
  await waitFor(() => expect(mockDispatch).toHaveBeenCalledWith(navigationAction('CANCELADA')));
});

test('un 409 con código desconocido conserva el estado como no confirmado', async () => {
  (reservationService.cancelForCheckout as jest.Mock).mockRejectedValue({
    response: { status: 409, data: { code: 'UNKNOWN_CONFLICT' } },
  });
  const view = renderPayment();
  await beginCheckout(view);
  fireEvent.press(view.getByLabelText('mobile.serviceDetail.back'));
  confirmCancellation(view);

  await waitFor(() => expect(mockAppAlert).toHaveBeenCalledWith(
    'No pudimos confirmar el estado',
    expect.any(String),
    expect.any(Array),
    'warning',
  ));
});

test('a non-pending reservation response blocks checkout cancellation', async () => {
  (reservationService.cancelForCheckout as jest.Mock).mockRejectedValue({
    response: { status: 409, data: { code: 'RESERVA_NO_PENDIENTE' } },
  });
  const view = renderPayment();
  await beginCheckout(view);
  fireEvent.press(view.getByLabelText('mobile.serviceDetail.back'));
  confirmCancellation(view);

  await waitFor(() => expect(mockAppAlert).toHaveBeenCalledWith(
    'Reserva no cancelable',
    'La reserva ya no está pendiente y no puede cancelarse por esta opción.',
    expect.any(Array),
    'warning',
  ));
});
