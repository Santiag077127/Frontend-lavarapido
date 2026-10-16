import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, expect, test } from '@jest/globals';

import { paymentService } from '../../../services/paymentService';
import { pendingCheckoutRecovery } from '../../../services/pendingCheckoutRecovery';
import { reservationService } from './reservationService';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));
jest.mock('../../../services/paymentService', () => ({
  paymentService: { getByReservation: jest.fn() },
}));
jest.mock('./reservationService', () => ({
  reservationService: { cancelForCheckout: jest.fn() },
}));

const storage = jest.mocked(AsyncStorage);
const payment = jest.mocked(paymentService);
const reservations = jest.mocked(reservationService);
const marker = {
  reservationId: 'reservation-1',
  userId: 'user-1',
  createdAt: '2026-10-15T12:00:00.000Z',
};

beforeEach(() => {
  jest.clearAllMocks();
  storage.getItem.mockResolvedValue(JSON.stringify([marker]));
  storage.setItem.mockResolvedValue();
  storage.removeItem.mockResolvedValue();
});

test('recovery never cancels a pending payment and keeps the marker', async () => {
  payment.getByReservation.mockResolvedValue({ estado: 'pendiente' } as never);

  await expect(pendingCheckoutRecovery.recover('user-1')).resolves.toEqual({
    cancelled: 0,
    protected: 0,
    deferred: 1,
  });
  expect(reservations.cancelForCheckout).not.toHaveBeenCalled();
  expect(storage.setItem).toHaveBeenCalledWith(
    'pending-reservation-checkouts',
    JSON.stringify([marker]),
  );
});

test('recovery cancels only after a rejected payment is confirmed by the backend', async () => {
  payment.getByReservation.mockResolvedValue({ estado: 'rechazado' } as never);
  reservations.cancelForCheckout.mockResolvedValue({} as never);

  await expect(pendingCheckoutRecovery.recover('user-1')).resolves.toEqual({
    cancelled: 1,
    protected: 0,
    deferred: 0,
  });
  expect(reservations.cancelForCheckout).toHaveBeenCalledWith('reservation-1');
  expect(storage.removeItem).toHaveBeenCalledWith('pending-reservation-checkouts');
});

test('recovery removes an approved marker without attempting cancellation', async () => {
  payment.getByReservation.mockResolvedValue({ estado: 'aprobado' } as never);

  await pendingCheckoutRecovery.recover('user-1');

  expect(reservations.cancelForCheckout).not.toHaveBeenCalled();
  expect(storage.removeItem).toHaveBeenCalledWith('pending-reservation-checkouts');
});

test('network failure keeps the marker for a later retry', async () => {
  payment.getByReservation.mockRejectedValue({ code: 'ERR_NETWORK' });

  await pendingCheckoutRecovery.recover('user-1');

  expect(reservations.cancelForCheckout).not.toHaveBeenCalled();
  expect(storage.setItem).toHaveBeenCalledWith(
    'pending-reservation-checkouts',
    JSON.stringify([marker]),
  );
});

