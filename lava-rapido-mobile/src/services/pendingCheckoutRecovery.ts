import AsyncStorage from '@react-native-async-storage/async-storage';

import { paymentService, type ReservationPayment } from './paymentService';
import { reservationService } from '../features/reservations/services/reservationService';

const storageKey = 'pending-reservation-checkouts';

export type PendingCheckout = {
  reservationId: string;
  userId: string;
  createdAt: string;
};

export type CheckoutRecoverySummary = {
  cancelled: number;
  protected: number;
  deferred: number;
};

type HttpFailure = {
  response?: { status?: number; data?: { code?: unknown } };
};

function failureCode(error: unknown): string | undefined {
  if (!error || typeof error !== 'object') return undefined;
  const code = (error as HttpFailure).response?.data?.code;
  return typeof code === 'string' ? code : undefined;
}

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
    // A missing payment is safe to submit to the backend cancellation check.
    // Any other read error leaves the outcome uncertain.
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
        if (payment?.estado === 'pendiente') {
          retained.push(entry);
          summary.deferred += 1;
          continue;
        }

        // A missing payment or a provider-confirmed rejection is sent to the
        // same idempotent endpoint, which performs the final safety check.
        await reservationService.cancelForCheckout(entry.reservationId);
        summary.cancelled += 1;
      } catch (error) {
        const status = failureStatus(error);
        const code = failureCode(error);
        if (status === 409 && code === 'PAGO_APROBADO') {
          summary.protected += 1;
          continue;
        }

        // PENDING, network failures, timeouts, 5xx, and unknown conflicts are
        // retained for a later run. No local state is treated as a failure.
        retained.push(entry);
        summary.deferred += 1;
      }
    }

    await writeEntries(retained);
    return summary;
  },
};

