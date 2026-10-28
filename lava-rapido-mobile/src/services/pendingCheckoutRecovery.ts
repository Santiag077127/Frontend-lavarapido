import AsyncStorage from '@react-native-async-storage/async-storage';

import { paymentService, type ReservationPayment } from './paymentService';

const storageKey = 'pending-reservation-checkouts';

export type PendingCheckout = {
  reservationId: string;
  userId: string;
  createdAt: string;
};

export type CheckoutRecoverySummary = {
  // Kept for callers that consume the legacy summary contract. Recovery no
  // longer cancels reservations, so this value is always zero.
  cancelled: number;
  protected: number;
  deferred: number;
};

type HttpFailure = {
  response?: { status?: number };
};

function failureStatus(error: unknown): number | undefined {
  if (!error || typeof error !== 'object') return undefined;
  return (error as HttpFailure).response?.status;
}

function isPendingCheckout(value: unknown): value is PendingCheckout {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  return typeof item.reservationId === 'string'
    && item.reservationId.length > 0
    && typeof item.userId === 'string'
    && item.userId.length > 0
    && typeof item.createdAt === 'string';
}

async function readEntries(): Promise<PendingCheckout[]> {
  const raw = await AsyncStorage.getItem(storageKey);
  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const unique = new Map<string, PendingCheckout>();
    parsed.filter(isPendingCheckout).forEach((entry) => {
      unique.set(`${entry.userId}:${entry.reservationId}`, entry);
    });
    return [...unique.values()];
  } catch {
    // Corrupt metadata cannot be used to make a cancellation decision.
    // Discarding only this marker leaves the server-side reservation intact.
    return [];
  }
}

async function writeEntries(entries: PendingCheckout[]): Promise<void> {
  if (entries.length === 0) {
    await AsyncStorage.removeItem(storageKey);
    return;
  }
  await AsyncStorage.setItem(storageKey, JSON.stringify(entries));
}

async function getPayment(reservationId: string): Promise<ReservationPayment | null> {
  try {
    return await paymentService.getByReservation(reservationId);
  } catch (error) {
    // A missing payment is retained for an explicit customer decision.
    // Any other read error also leaves the outcome uncertain.
    if (failureStatus(error) === 404) return null;
    throw error;
  }
}

/**
 * Persists only a recovery marker. The backend remains the authority for
 * payment state and for deciding whether cancellation is safe.
 */
export const pendingCheckoutRecovery = {
  mark: async (reservationId: string, userId: string): Promise<void> => {
    if (!reservationId || !userId) return;
    const entries = await readEntries();
    const next: PendingCheckout = {
      reservationId,
      userId,
      createdAt: new Date().toISOString(),
    };
    const withoutCurrent = entries.filter(
      (entry) => !(entry.reservationId === reservationId && entry.userId === userId),
    );
    await writeEntries([...withoutCurrent, next]);
  },

  clear: async (reservationId: string, userId?: string): Promise<void> => {
    const entries = await readEntries();
    await writeEntries(entries.filter((entry) =>
      entry.reservationId !== reservationId
      || (userId !== undefined && entry.userId !== userId),
    ));
  },

  recover: async (userId: string): Promise<CheckoutRecoverySummary> => {
    if (!userId) return { cancelled: 0, protected: 0, deferred: 0 };

    const entries = await readEntries();
    const forUser = entries.filter((entry) => entry.userId === userId);
    const retained = entries.filter((entry) => entry.userId !== userId);
    const summary: CheckoutRecoverySummary = { cancelled: 0, protected: 0, deferred: 0 };

    for (const entry of forUser) {
      try {
        const payment = await getPayment(entry.reservationId);
        if (payment?.estado === 'aprobado') {
          // Removing metadata does not cancel the approved reservation.
          summary.protected += 1;
          continue;
        }
        // Recovery never turns local payment state into cancellation consent.
        // Pending, rejected, and missing payments remain available for an
        // explicit customer decision in the reservation or checkout screens.
        retained.push(entry);
        summary.deferred += 1;
      } catch {
        retained.push(entry);
        summary.deferred += 1;
      }
    }

    await writeEntries(retained);
    return summary;
  },
};

