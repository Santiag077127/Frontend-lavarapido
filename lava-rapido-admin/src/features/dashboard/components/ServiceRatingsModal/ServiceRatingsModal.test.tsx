import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider } from "@/theme/theme";
import { translations } from "@/theme/theme";
import { AxiosError } from "axios";
import type { Reserva } from "../../services/reservaService";
import type { Servicio } from "@/features/dashboard/types";

const mocks = vi.hoisted(() => ({ listReservations: vi.fn(), getRating: vi.fn() }));
vi.mock("../../services/reservaService", () => ({ listarReservas: mocks.listReservations }));
vi.mock("../../services/serviceRatingService", () => ({ getRatingForReservation: mocks.getRating }));
import { ServiceRatingsModal } from "./ServiceRatingsModal";

const service: Servicio = { idServicio: "service-1", nombre: "Lavado premium", descripcion: "", precio: 100, duracionMinutos: 30, estado: true, createdAt: "", updatedAt: "" };
const reservation = (id: string, serviceId: string, estado: Reserva["estado"]): Reserva => ({
  idReserva: id, idUsuario: "private-user-id", nombreUsuario: "Private User", idVehiculo: "vehicle-1", placaVehiculo: "ABC123",
  tipoVehiculo: null, idServicio: serviceId, nombreServicio: "Lavado premium", descripcionServicio: null, precioServicio: 100,
  duracionServicio: 30, fechaReserva: "2026-01-01", horaReserva: "10:00", fechaHoraInicio: null, fechaHoraFin: null,
  estado, createdAt: "2026-01-01", updatedAt: "2026-01-01", operadorNombre: null,
});
const renderModal = () => render(<ThemeProvider><ServiceRatingsModal servicio={service} onClose={vi.fn()} /></ThemeProvider>);

describe("ServiceRatingsModal", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.listReservations.mockResolvedValue([reservation("reservation-1", "service-1", "FINALIZADA")]);
    mocks.getRating.mockResolvedValue({ idCalificacion: "rating-1", reservaId: "reservation-1", usuarioId: "private-user-id", puntuacion: 5, comentario: "Excelente servicio", createdAt: "2026-06-01T12:00:00", updatedAt: null });
  });

  it("loads ratings only for finalized reservations of the selected service and shows real fields", async () => {
    mocks.listReservations.mockResolvedValue([
      reservation("reservation-1", "service-1", "FINALIZADA"),
      reservation("reservation-2", "service-2", "FINALIZADA"),
      reservation("reservation-3", "service-1", "PENDIENTE"),
    ]);
    renderModal();

    expect(await screen.findByText("Excelente servicio")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "5 de 5 estrellas" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Calificaciones de Lavado premium" })).toBeInTheDocument();
    expect(screen.queryByText("private-user-id")).toBeNull();
    expect(mocks.getRating).toHaveBeenCalledTimes(1);
    expect(mocks.getRating).toHaveBeenCalledWith("reservation-1");
    expect(screen.queryByRole("button", { name: /editar|eliminar|agregar/i })).toBeNull();
  });

  it("shows the empty state when no reservations can have a rating", async () => {
    mocks.listReservations.mockResolvedValue([reservation("reservation-1", "service-1", "CANCELADA")]);
    renderModal();
    expect(await screen.findByText("Sin calificaciones para este servicio.")).toBeInTheDocument();
    expect(mocks.getRating).not.toHaveBeenCalled();
  });

  it("treats the backend 404 for a reservation without a rating as an empty result", async () => {
    mocks.getRating.mockRejectedValue(new AxiosError("not found", "ERR_BAD_REQUEST", undefined, undefined, {
      data: {}, status: 404, statusText: "Not Found", headers: {}, config: {} as never,
    }));
    renderModal();
    expect(await screen.findByText("Sin calificaciones para este servicio.")).toBeInTheDocument();
  });

  it("uses the localized error state when the read request fails", async () => {
    mocks.listReservations.mockRejectedValue(new Error("network details"));
    renderModal();
    expect(await screen.findByRole("alert")).toHaveTextContent("No pudimos cargar las calificaciones. Intenta de nuevo.");
    expect(screen.queryByText("network details")).toBeNull();
  });

  it("handles optional comments and missing rating dates", async () => {
    mocks.getRating.mockResolvedValue({ idCalificacion: "rating-2", reservaId: "reservation-1", usuarioId: "private-user-id", puntuacion: 4, comentario: null, createdAt: null, updatedAt: null });
    renderModal();
    await waitFor(() => expect(screen.getByRole("img", { name: "4 de 5 estrellas" })).toBeInTheDocument());
    expect(screen.queryByText(/Comentario:/)).toBeNull();
    expect(screen.getByText(/Fecha no disponible/)).toBeInTheDocument();
  });

  it("provides every new label in the four supported locales", () => {
    for (const language of ["es", "en", "fr", "pt"] as const) {
      for (const key of ["serviceRatings.action", "serviceRatings.title", "serviceRatings.loading", "serviceRatings.empty", "serviceRatings.error", "serviceRatings.scoreLabel", "serviceRatings.comment", "serviceRatings.date", "serviceRatings.noDate", "serviceRatings.close"]) {
        expect(translations[language][key]).toBeTruthy();
      }
    }
  });
});
