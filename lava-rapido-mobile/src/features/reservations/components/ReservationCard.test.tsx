import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import ReservationCard from './ReservationCard';
import type { ReservationResponse } from '../types/reservation.types';

jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
jest.mock('../../../theme/ThemeContext', () => ({
  ThemeContext: require('react').createContext({
    theme: new Proxy({}, { get: () => '#fff' }),
    darkMode: false,
  }),
}));

const reservation: ReservationResponse = {
  idReserva: 'reservation-123',
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

const onCancel = jest.fn();
const onOpenDetails = jest.fn();

beforeEach(() => jest.clearAllMocks());

test('renders reservation details and delegates both actions with the original reservation', () => {
  const view = render(
    <ReservationCard
      reservation={reservation}
      cancellable
      cancelling={false}
      onCancel={onCancel}
      onOpenDetails={onOpenDetails}
    />,
  );

  expect(view.getByText('Lavado exterior')).toBeTruthy();
  expect(view.getByText('mobile.reservationDetail.status.pending')).toBeTruthy();
  expect(view.getByText('10/11/2026')).toBeTruthy();
  expect(view.getByText('10:30')).toBeTruthy();
  expect(view.getByText('ABC123')).toBeTruthy();
  expect(view.getByText('$25.000')).toBeTruthy();

  fireEvent.press(view.getByRole('button', { name: 'mobile.reservations.cancelTitle: Lavado exterior' }));
  fireEvent.press(view.getByRole('button', { name: 'mobile.services.detail' }));
  expect(onCancel).toHaveBeenCalledTimes(1);
  expect(onCancel).toHaveBeenCalledWith(reservation);
  expect(onOpenDetails).toHaveBeenCalledTimes(1);
  expect(onOpenDetails).toHaveBeenCalledWith(reservation);
});

test.each([
  ['ASIGNADA', 'assigned'],
  ['EN_PROCESO', 'inProcess'],
  ['FINALIZADA', 'finished'],
  ['CANCELADA', 'cancelled'],
] as const)('renders the %s status without offering cancellation', (estado, label) => {
  const view = render(
    <ReservationCard
      reservation={{ ...reservation, estado }}
      cancellable={false}
      cancelling={false}
      onCancel={onCancel}
      onOpenDetails={onOpenDetails}
    />,
  );

  expect(view.getByText(`mobile.reservationDetail.status.${label}`)).toBeTruthy();
  expect(view.queryByRole('button', { name: 'mobile.reservations.cancelTitle: Lavado exterior' })).toBeNull();
});

test('disables cancellation and announces progress while a request is in flight', () => {
  const view = render(
    <ReservationCard
      reservation={reservation}
      cancellable
      cancelling
      onCancel={onCancel}
      onOpenDetails={onOpenDetails}
    />,
  );

  const button = view.getByRole('button', {
    name: 'mobile.reservations.cancelTitle: Lavado exterior, accessibility.inProgress',
  });
  expect(button.props.accessibilityState).toEqual({ disabled: true, busy: true });
  fireEvent.press(button);
  expect(onCancel).not.toHaveBeenCalled();
});
