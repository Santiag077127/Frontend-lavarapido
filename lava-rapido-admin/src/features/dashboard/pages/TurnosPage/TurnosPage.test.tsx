import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const reservasMock = vi.hoisted(() => ({ listar: vi.fn(), crear: vi.fn() }));
const vehiculosMock = vi.hoisted(() => vi.fn());
const serviciosMock = vi.hoisted(() => vi.fn());

vi.mock("../../services/reservaService", () => ({
  listarReservas: reservasMock.listar,
  crearReserva: reservasMock.crear,
}));
vi.mock("../../services/vehiculoService", () => ({ getVehiculos: vehiculosMock }));
vi.mock("../../services/servicioService", () => ({ getServiciosDisponibles: serviciosMock }));
vi.mock("../../components/CobrarReservaButton/CobrarReservaButton", () => ({ CobrarReservaButton: () => null }));
vi.mock("../../components/TurnoDetailModal/TurnoDetailModal", () => ({ TurnoDetailModal: () => null }));

import { TurnosPage } from "./TurnosPage";

describe("TurnosPage - reserva presencial", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    reservasMock.listar.mockResolvedValue([]);
    vehiculosMock.mockResolvedValue([]);
    serviciosMock.mockResolvedValue([]);
  });

  it("muestra la validacion dentro del formulario y no envia la reserva vacia", async () => {
    const { container } = render(<TurnosPage />);
    await waitFor(() => expect(reservasMock.listar).toHaveBeenCalled());
    fireEvent.click(container.querySelector(".gt-btn-nuevo")!);
    fireEvent.click(screen.getByRole("button", { name: "Registrar" }));

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Completa todos los campos de la reserva.");
    expect(alert.closest("form")).toHaveClass("gt-form");
    expect(reservasMock.crear).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    fireEvent.click(container.querySelector(".gt-btn-nuevo")!);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("muestra el error de la API dentro del formulario sin cerrar el modal", async () => {
    vehiculosMock.mockResolvedValue([{ idVehiculo: "veh-1", estado: true, placa: "AAA123", nombreUsuario: "Prueba" }]);
    serviciosMock.mockResolvedValue([{ idServicio: "svc-1", estado: true, nombre: "Lavado", duracionMinutos: 30 }]);
    reservasMock.crear.mockRejectedValue(new Error("fallo de prueba"));

    const { container } = render(<TurnosPage />);
    fireEvent.click(container.querySelector(".gt-btn-nuevo")!);
    await screen.findByText("AAA123 · Prueba");
    fireEvent.change(screen.getByLabelText("Vehículo"), { target: { value: "veh-1" } });
    fireEvent.change(screen.getByLabelText("Servicio"), { target: { value: "svc-1" } });
    fireEvent.change(screen.getByLabelText("Fecha"), { target: { value: "2026-10-01" } });
    fireEvent.change(screen.getByLabelText("Hora"), { target: { value: "09:00" } });
    fireEvent.click(screen.getByRole("button", { name: "Registrar" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("No se pudo registrar la reserva.");
    expect(alert.closest("form")).toHaveClass("gt-form");
    expect(reservasMock.crear).toHaveBeenCalledWith({
      fkIdVehiculo: "veh-1",
      fkIdServicio: "svc-1",
      fechaReserva: "2026-10-01",
      horaReserva: "09:00:00",
    });
  });

  it("agrega a Turnos la reserva devuelta por el backend", async () => {
    vehiculosMock.mockResolvedValue([{ idVehiculo: "veh-1", estado: true, placa: "AAA123", nombreUsuario: "Prueba" }]);
    serviciosMock.mockResolvedValue([{ idServicio: "svc-1", estado: true, nombre: "Lavado", duracionMinutos: 30 }]);
    reservasMock.crear.mockResolvedValue({
      idReserva: "reserva-nueva",
      fechaReserva: "2026-10-01",
      horaReserva: "09:00:00",
      placaVehiculo: "AAA123",
      nombreUsuario: "Prueba",
      nombreServicio: "Lavado",
      estado: "PENDIENTE",
      duracionServicio: 30,
      precioServicio: 30000,
    });

    const { container } = render(<TurnosPage />);
    fireEvent.click(container.querySelector(".gt-btn-nuevo")!);
    await screen.findByText("AAA123 · Prueba");
    fireEvent.change(screen.getByLabelText("Vehículo"), { target: { value: "veh-1" } });
    fireEvent.change(screen.getByLabelText("Servicio"), { target: { value: "svc-1" } });
    fireEvent.change(screen.getByLabelText("Fecha"), { target: { value: "2026-10-01" } });
    fireEvent.change(screen.getByLabelText("Hora"), { target: { value: "09:00" } });
    fireEvent.click(screen.getByRole("button", { name: "Registrar" }));

    await waitFor(() => expect(screen.queryByRole("heading", { name: "Reserva presencial" })).not.toBeInTheDocument());
    expect(screen.getByText("AAA123")).toBeInTheDocument();
    expect(screen.getByText("Lavado")).toBeInTheDocument();
    expect(reservasMock.crear).toHaveBeenCalledWith({
      fkIdVehiculo: "veh-1",
      fkIdServicio: "svc-1",
      fechaReserva: "2026-10-01",
      horaReserva: "09:00:00",
    });
  });
});
