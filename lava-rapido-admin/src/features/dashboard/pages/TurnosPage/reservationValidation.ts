import type { EstadoReserva } from "../../services/reservaService";

const TIME_ZONE = "America/Bogota";
const OPENING_MINUTE = 6 * 60;
const CLOSING_MINUTE = 20 * 60;

type ReservationLike = {
  idReserva?: string;
  idVehiculo: string;
  fechaReserva: string;
  horaReserva: string;
  duracionServicio: number;
  estado: EstadoReserva;
};

export type WalkInForm = { vehiculo: string; servicio: string; fecha: string; hora: string };
export type WalkInField = keyof WalkInForm;

const validDate = (value: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
};

export const getBogotaDateTime = (now = new Date()) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(now);
  const value = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return { date: `${value.year}-${value.month}-${value.day}`, time: `${value.hour}:${value.minute}` };
};

export const getMinimumReservationDate = (now = new Date()): string => {
  const localDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const bogotaDate = getBogotaDateTime(now).date;
  return localDate > bogotaDate ? localDate : bogotaDate;
};

export const getWalkInFieldErrors = (
  form: WalkInForm,
  duration: number | undefined,
  now = new Date(),
): Partial<Record<WalkInField, string>> => {
  const errors: Partial<Record<WalkInField, string>> = {};
  const today = getBogotaDateTime(now);
  const minimumDate = getMinimumReservationDate(now);
  if (!form.vehiculo) errors.vehiculo = "ui.completa.todos.los.campos.de.la.reserva";
  if (!form.servicio) errors.servicio = "ui.completa.todos.los.campos.de.la.reserva";
  else if (duration === undefined || !Number.isInteger(duration) || duration < 15 || duration > 180) errors.servicio = "turns.invalidDuration";
  if (!form.fecha) errors.fecha = "turns.dateRequired";
  else if (!validDate(form.fecha)) errors.fecha = "turns.invalidDate";
  else if (form.fecha < minimumDate) errors.fecha = "turns.pastDate";

  const match = /^(\d{2}):(\d{2})$/.exec(form.hora);
  if (!form.hora || !match) errors.hora = "turns.timeRequired";
  else if (duration && !errors.servicio) {
    const start = Number(match[1]) * 60 + Number(match[2]);
    if (form.fecha === today.date && form.hora <= today.time) errors.hora = "turns.pastTime";
    else if (start < OPENING_MINUTE || start > CLOSING_MINUTE || start + duration > CLOSING_MINUTE) {
      errors.hora = "turns.outsideBusinessHours";
    }
  }
  return errors;
};

export const hasVehicleReservationConflict = (
  form: WalkInForm,
  duration: number,
  reservations: ReservationLike[],
): boolean => {
  const time = /^(\d{2}):(\d{2})$/.exec(form.hora);
  if (!time) return false;
  const start = Number(time[1]) * 60 + Number(time[2]);
  const end = start + duration;
  return reservations.some((reservation) => {
    if (reservation.estado === "CANCELADA" || reservation.idVehiculo !== form.vehiculo || reservation.fechaReserva !== form.fecha) return false;
    const existing = /^(\d{2}):(\d{2})/.exec(reservation.horaReserva);
    if (!existing || !Number.isInteger(reservation.duracionServicio)) return false;
    const existingStart = Number(existing[1]) * 60 + Number(existing[2]);
    return start < existingStart + reservation.duracionServicio && existingStart < end;
  });
};
