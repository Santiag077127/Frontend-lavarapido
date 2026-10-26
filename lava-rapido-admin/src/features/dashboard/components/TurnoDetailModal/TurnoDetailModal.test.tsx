import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { EstadoReserva, Reserva } from "../../services/reservaService";
import { TurnoDetailModal } from "./TurnoDetailModal";

vi.mock("../CobrarReservaButton/CobrarReservaButton", () => ({
  CobrarReservaButton: () => <div>Controles de pago</div>,
}));

vi.mock("../../services/operadorService", () => ({
  listarOperadores: vi.fn().mockResolvedValue([]),
  crearAsignacion: vi.fn(),
}));

const reservation = (estado: EstadoReserva): Reserva => ({
  idReserva: `reservation-${estado}`,
  idUsuario: "user-1",
  nombreUsuario: "Cliente Prueba",
  idVehiculo: "vehicle-1",
  placaVehiculo: "ABC123",
  tipoVehiculo: "CARRO",
  idServicio: "service-1",
  nombreServicio: "Lavado",
  descripcionServicio: "Lavado general",
  precioServicio: 30000,
  duracionServicio: 30,
  fechaReserva: "2099-10-01",
  horaReserva: "09:00:00",
  fechaHoraInicio: null,
  fechaHoraFin: null,
  estado,
  createdAt: "2099-09-01T09:00:00",
  updatedAt: "2099-09-01T09:00:00",
  operadorNombre: null,
});

const callbacks = {
  onClose: vi.fn(),
  onCambiarEstado: vi.fn().mockResolvedValue(undefined),
  onPagoAprobado: vi.fn().mockResolvedValue(undefined),
  onAsignado: vi.fn().mockResolvedValue(undefined),
  onError: vi.fn(),
};

describe("TurnoDetailModal", () => {
  it.each<EstadoReserva>(["PENDIENTE", "ASIGNADA", "EN_PROCESO", "FINALIZADA", "CANCELADA"])(
    "does not show reservation cancellation for %s reservations",
    (estado) => {
      render(<TurnoDetailModal reserva={reservation(estado)} {...callbacks} />);

      expect(screen.queryByRole("button", { name: "Cancelar" })).not.toBeInTheDocument();
      expect(screen.queryByText("Cancelar reserva")).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Cerrar" })).toBeInTheDocument();
      expect(screen.getByText("Controles de pago")).toBeInTheDocument();
    },
  );

  it("keeps administrative state actions available", () => {
    const { rerender } = render(<TurnoDetailModal reserva={reservation("ASIGNADA")} {...callbacks} />);
    fireEvent.click(screen.getByRole("button", { name: "Iniciar" }));
    expect(callbacks.onCambiarEstado).toHaveBeenCalledWith("EN_PROCESO");

    rerender(<TurnoDetailModal reserva={reservation("EN_PROCESO")} {...callbacks} />);
    expect(screen.getByRole("button", { name: "Finalizar" })).toBeInTheDocument();
  });
});
