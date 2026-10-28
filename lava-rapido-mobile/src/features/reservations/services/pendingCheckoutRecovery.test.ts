import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, expect, test } from '@jest/globals';

import { paymentService } from '../../../services/paymentService';
import { pendingCheckoutRecovery } from '../../../services/pendingCheckoutRecovery';

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
const storage = jest.mocked(AsyncStorage);
const payment = jest.mocked(paymentService);
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
  expect(storage.setItem).toHaveBeenCalledWith(
    'pending-reservation-checkouts',
    JSON.stringify([marker]),
  );
});

test('recovery keeps a rejected payment marker until the user decides explicitly', async () => {
  payment.getByReservation.mockResolvedValue({ estado: 'rechazado' } as never);

  await expect(pendingCheckoutRecovery.recover('user-1')).resolves.toEqual({
    cancelled: 0,
    protected: 0,
    deferred: 1,
  });
  expect(storage.setItem).toHaveBeenCalledWith(
    'pending-reservation-checkouts',
    JSON.stringify([marker]),
  );
});

test('recovery removes an approved marker without attempting cancellation', async () => {
  payment.getByReservation.mockResolvedValue({ estado: 'aprobado' } as never);

  await pendingCheckoutRecovery.recover('user-1');

  expect(storage.removeItem).toHaveBeenCalledWith('pending-reservation-checkouts');
});

test('network failure keeps the marker for a later retry', async () => {
  payment.getByReservation.mockRejectedValue({ code: 'ERR_NETWORK' });

  await pendingCheckoutRecovery.recover('user-1');

  expect(storage.setItem).toHaveBeenCalledWith(
    'pending-reservation-checkouts',
    JSON.stringify([marker]),
  );
});

test('recovery keeps a missing payment marker without treating absence as consent', async () => {
  payment.getByReservation.mockRejectedValue({ response: { status: 404 } });

  await expect(pendingCheckoutRecovery.recover('user-1')).resolves.toEqual({
    cancelled: 0,
    protected: 0,
    deferred: 1,
  });
  expect(storage.setItem).toHaveBeenCalledWith(
    'pending-reservation-checkouts',
    JSON.stringify([marker]),
  );
});

