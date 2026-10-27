import { beforeEach, describe, expect, it, vi } from "vitest";

const get = vi.hoisted(() => vi.fn());
vi.mock("@/services/api", () => ({ api: { get } }));
import { getRatingForReservation } from "./serviceRatingService";

describe("serviceRatingService", () => {
  beforeEach(() => vi.resetAllMocks());

  it("reads the existing reservation rating endpoint", async () => {
    const rating = { idCalificacion: "rating-1", reservaId: "reservation-1", usuarioId: "user-1", puntuacion: 5, comentario: null, createdAt: null, updatedAt: null };
    get.mockResolvedValue({ data: rating });

    await expect(getRatingForReservation("reservation-1")).resolves.toEqual(rating);
    expect(get).toHaveBeenCalledWith("/calificaciones/reserva/reservation-1");
  });
});
