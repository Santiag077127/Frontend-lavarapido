/// <reference types="jest" />
import { beforeEach, expect, jest, test } from '@jest/globals';
import api from '../../../services/api';
import { reservationService } from './reservationService';

jest.mock('../../../services/api', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn(),
    patch: jest.fn(),
  },
}));

const mockApi = jest.mocked(api);

beforeEach(() => {
  jest.clearAllMocks();
});

test('returns a valid reservation creation response', async () => {
  const data = {
    idReserva: 'reservation-1',
    fechaReserva: '2026-10-16',
    horaReserva: '12:00:00',
    estado: 'PENDIENTE',
  };
  mockApi.post.mockResolvedValue({ data } as never);

  await expect(reservationService.create({
    fkIdVehiculo: 'vehicle-1',
    fkIdServicio: 'service-1',
    fechaReserva: '2026-10-16',
    horaReserva: '12:00:00',
  })).resolves.toEqual(data);
});

test('rejects an empty or unexpected creation response', async () => {
  mockApi.post.mockResolvedValue({ data: {} } as never);

  await expect(reservationService.create({
    fkIdVehiculo: 'vehicle-1',
    fkIdServicio: 'service-1',
    fechaReserva: '2026-10-16',
    horaReserva: '12:00:00',
  })).rejects.toThrow('Respuesta de reserva inválida');
});

test('lists reservations for the requested user', async () => {
  const data = [{ idReserva: 'reservation-1' }];
  mockApi.get.mockResolvedValue({ data } as never);

  await expect(reservationService.getByUser('user-1')).resolves.toEqual(data);
  expect(mockApi.get).toHaveBeenCalledWith('/api/reservas/usuario/user-1');
});

test('cancels the requested reservation through the existing endpoint', async () => {
  const data = { idReserva: 'reservation-1', estado: 'CANCELADA' };
  mockApi.patch.mockResolvedValue({ data } as never);

  await expect(reservationService.cancel('reservation-1')).resolves.toEqual(data);
  expect(mockApi.patch).toHaveBeenCalledWith('/api/reservas/reservation-1/cancelar');
});

test.each(['CANCELLED', 'ALREADY_CANCELLED'] as const)(
  'returns the validated %s checkout cancellation result',
  async (result) => {
    const reservation = {
      idReserva: 'reservation-1',
      fechaReserva: '2026-10-16',
      horaReserva: '12:00:00',
      estado: 'CANCELADA',
    };
    mockApi.patch.mockResolvedValue({
      data: reservation,
      headers: { 'x-reservation-cancellation-result': result },
    } as never);

    await expect(
      reservationService.cancelForCheckout('reservation-1'),
    ).resolves.toEqual({ reservation, result });
    expect(mockApi.patch).toHaveBeenCalledWith('/api/reservas/reservation-1/cancelar');
  },
);

test('rejects checkout cancellation responses with an invalid body', async () => {
  mockApi.patch.mockResolvedValue({
    data: {
      idReserva: 'reservation-1',
      fechaReserva: '2026-10-16',
      horaReserva: '12:00:00',
      estado: 'PENDIENTE',
    },
    headers: {},
  } as never);

  await expect(
    reservationService.cancelForCheckout('reservation-1'),
  ).rejects.toThrow('Respuesta de cancelación de reserva inválida');
});

test('accepts a valid cancellation body when an older backend omits the optional result header', async () => {
  const reservation = {
    idReserva: 'reservation-1',
    fechaReserva: '2026-10-16',
    horaReserva: '12:00:00',
    estado: 'CANCELADA',
  };
  mockApi.patch.mockResolvedValue({ data: reservation, headers: {} } as never);

  await expect(reservationService.cancelForCheckout('reservation-1')).resolves.toEqual({
    reservation,
    result: 'CANCELLED',
  });
});

test('rejects a cancellation response for another reservation or a non-cancelled state', async () => {
  mockApi.patch.mockResolvedValue({
    data: {
      idReserva: 'another-reservation',
      fechaReserva: '2026-10-16',
      horaReserva: '12:00:00',
      estado: 'PENDIENTE',
    },
    headers: { 'x-reservation-cancellation-result': 'CANCELLED' },
  } as never);

  await expect(
    reservationService.cancelForCheckout('reservation-1'),
  ).rejects.toThrow('Respuesta de cancelación de reserva inválida');
});
