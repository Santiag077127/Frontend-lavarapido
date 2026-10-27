import { describe, expect, it } from "vitest";
import { getBogotaDateTime, getMinimumReservationDate, getWalkInFieldErrors, hasVehicleReservationConflict, type WalkInForm } from "./reservationValidation";

const form = (overrides: Partial<WalkInForm> = {}): WalkInForm => ({ vehiculo: "vehicle-1", servicio: "service-1", fecha: "2026-10-27", hora: "09:00", ...overrides });
const now = new Date("2026-10-27T14:00:00.000Z"); // 09:00 in America/Bogota.

describe("walk-in reservation validation", () => {
  it("rejects past dates, malformed dates and times that have already passed", () => {
    expect(getWalkInFieldErrors(form({ fecha: "2026-10-26" }), 30, now).fecha).toBe("turns.pastDate");
    expect(getWalkInFieldErrors(form({ fecha: "2026-02-30" }), 30, now).fecha).toBe("turns.invalidDate");
    expect(getWalkInFieldErrors(form(), 30, now).hora).toBe("turns.pastTime");
  });

  it("accepts a future time today and a future date within business hours", () => {
    expect(getWalkInFieldErrors(form({ hora: "09:01" }), 30, now)).toEqual({});
    expect(getWalkInFieldErrors(form({ fecha: "2026-10-28", hora: "06:00" }), 30, now)).toEqual({});
  });

  it("keeps the date picker at or after both the user-local and backend dates", () => {
    const localDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    expect(getMinimumReservationDate(now) >= localDate).toBe(true);
    expect(getMinimumReservationDate(now) >= getBogotaDateTime(now).date).toBe(true);
  });

  it("applies the backend opening hours and service end time", () => {
    expect(getWalkInFieldErrors(form({ fecha: "2026-10-28", hora: "05:59" }), 30, now).hora).toBe("turns.outsideBusinessHours");
    expect(getWalkInFieldErrors(form({ hora: "19:45" }), 30, now).hora).toBe("turns.outsideBusinessHours");
    expect(getWalkInFieldErrors(form({ hora: "19:30" }), 30, now)).toEqual({});
  });

  it("detects overlap with non-cancelled bookings only", () => {
    const reservations = [
      { idReserva: "active", idVehiculo: "vehicle-1", fechaReserva: "2026-10-27", horaReserva: "09:15:00", duracionServicio: 30, estado: "PENDIENTE" as const },
      { idReserva: "cancelled", idVehiculo: "vehicle-1", fechaReserva: "2026-10-27", horaReserva: "09:00:00", duracionServicio: 30, estado: "CANCELADA" as const },
    ];
    expect(hasVehicleReservationConflict(form({ hora: "09:30" }), 30, reservations)).toBe(true);
    expect(hasVehicleReservationConflict(form({ vehiculo: "vehicle-2" }), 30, reservations)).toBe(false);
    expect(hasVehicleReservationConflict(form({ hora: "10:00" }), 30, reservations)).toBe(false);
  });
});
