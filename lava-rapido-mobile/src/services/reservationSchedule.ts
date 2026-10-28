export const RESERVATION_MIN_HOUR = 6;
export const RESERVATION_MAX_HOUR = 20;

export function startOfLocalDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function isSameLocalDate(first: Date, second: Date): boolean {
  return startOfLocalDay(first).getTime() === startOfLocalDay(second).getTime();
}

export function isPastLocalDate(date: Date, now: Date = new Date()): boolean {
  return startOfLocalDay(date).getTime() < startOfLocalDay(now).getTime();
}

export function isPastLocalTime(
  time: Date,
  date: Date,
  now: Date = new Date(),
): boolean {
  if (!isSameLocalDate(date, now)) {
    return false;
  }

  const selectedMinutes = time.getHours() * 60 + time.getMinutes();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  return selectedMinutes < currentMinutes;
}

export function getReservationTimeError(
  time: Date,
  durationMinutes: number,
): 'beforeOpening' | 'afterClosing' | 'durationAfterClosing' | null {
  const startMinutes = time.getHours() * 60 + time.getMinutes();
  const openingMinutes = RESERVATION_MIN_HOUR * 60;
  const closingMinutes = RESERVATION_MAX_HOUR * 60;

  if (startMinutes < openingMinutes) {
    return 'beforeOpening';
  }

  if (startMinutes >= closingMinutes) {
    return 'afterClosing';
  }

  if (durationMinutes > 0 && startMinutes + durationMinutes > closingMinutes) {
    return 'durationAfterClosing';
  }

  return null;
}
