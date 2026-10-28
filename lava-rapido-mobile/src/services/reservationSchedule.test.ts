import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getReservationTimeError,
  isPastLocalDate,
  isPastLocalTime,
  startOfLocalDay,
} from './reservationSchedule.ts';

const now = new Date(2026, 9, 15, 12, 30, 0, 0);

test('reservation schedule validation', async (t) => {
  await t.test('rejects dates before today using local calendar values', () => {
    assert.equal(isPastLocalDate(new Date(2026, 9, 14, 23, 59), now), true);
    assert.equal(isPastLocalDate(new Date(2026, 9, 15, 0, 0), now), false);
  });

  await t.test('rejects only past times for the current local date', () => {
    const today = startOfLocalDay(now);
    assert.equal(isPastLocalTime(new Date(2026, 9, 15, 12, 29), today, now), true);
    assert.equal(isPastLocalTime(new Date(2026, 9, 15, 12, 30), today, now), false);
    assert.equal(isPastLocalTime(new Date(2026, 9, 16, 8, 0), new Date(2026, 9, 16), now), false);
  });

  await t.test('validates opening, closing and service duration', () => {
    assert.equal(getReservationTimeError(new Date(2026, 9, 15, 5, 59), 60), 'beforeOpening');
    assert.equal(getReservationTimeError(new Date(2026, 9, 15, 20, 0), 30), 'afterClosing');
    assert.equal(getReservationTimeError(new Date(2026, 9, 15, 19, 30), 60), 'durationAfterClosing');
    assert.equal(getReservationTimeError(new Date(2026, 9, 15, 19, 0), 60), null);
  });
});
