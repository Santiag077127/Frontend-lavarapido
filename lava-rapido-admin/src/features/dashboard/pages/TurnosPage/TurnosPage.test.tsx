// Prueba el comportamiento de gestión de reservas.
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const reservasMock = vi.hoisted(() => ({ listar: vi.fn(), crear: vi.fn(), cambiar: vi.fn() }));
const vehiculosMock = vi.hoisted(() => vi.fn());
const serviciosMock = vi.hoisted(() => vi.fn());
const detailModalMock = vi.hoisted(() => vi.fn());

vi.mock("../../services/reservaService", () => ({
  listarReservas: reservasMock.listar,
  crearReserva: reservasMock.crear,
  cambiarEstado: reservasMock.cambiar,
}));
vi.mock("../../services/vehiculoService", () => ({ getVehiculos: vehiculosMock }));
vi.mock("../../services/servicioService", () => ({ getServiciosDisponibles: serviciosMock }));
vi.mock("../../components/CobrarReservaButton/CobrarReservaButton", () => ({ CobrarReservaButton: () => null }));
vi.mock("../../components/TurnoDetailModal/TurnoDetailModal", () => ({
  TurnoDetailModal: (props: Record<string, unknown>) => {
    detailModalMock(props);
    return <div>Detalle de prueba</div>;
  },
}));

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

    expect(screen.getAllByText("Completa todos los campos de la reserva.")[0].closest("label")).toHaveAttribute("for", "walk-in-vehicle");
    expect(screen.getByText("Selecciona una fecha para continuar.").closest("label")).toHaveAttribute("for", "walk-in-date");
    expect(reservasMock.crear).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    fireEvent.click(container.querySelector(".gt-btn-nuevo")!);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("clears every field and validation state when cancelling and reopening the form", async () => {
    vehiculosMock.mockResolvedValue([{ idVehiculo: "veh-1", estado: true, placa: "AAA123", nombreUsuario: "Prueba" }]);
    serviciosMock.mockResolvedValue([{ idServicio: "svc-1", estado: true, nombre: "Lavado", duracionMinutos: 30 }]);
    reservasMock.crear.mockRejectedValue(new Error("fallo de prueba"));
    const { container } = render(<TurnosPage />);
    fireEvent.click(container.querySelector(".gt-btn-nuevo")!);
    await screen.findByText("AAA123 · Prueba");
    fireEvent.change(screen.getByLabelText("Vehículo"), { target: { value: "veh-1" } });
    fireEvent.change(screen.getByLabelText("Servicio"), { target: { value: "svc-1" } });
    fireEvent.change(screen.getByLabelText("Fecha"), { target: { value: "2099-10-01" } });
    fireEvent.change(screen.getByLabelText("Hora"), { target: { value: "09:00" } });
    fireEvent.click(screen.getByRole("button", { name: "Registrar" }));
    expect(await screen.findByText("No se pudo registrar la reserva.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    fireEvent.click(container.querySelector(".gt-btn-nuevo")!);
    expect(screen.getByLabelText("Vehículo")).toHaveValue("");
    expect(screen.getByLabelText("Servicio")).toHaveValue("");
    expect(screen.getByLabelText("Fecha")).toHaveValue("");
    expect(screen.getByLabelText("Hora")).toHaveValue("");
    expect(screen.queryByText("No se pudo registrar la reserva.")).not.toBeInTheDocument();
  });

  it("does not create a booking if the fresh availability check fails", async () => {
    vehiculosMock.mockResolvedValue([{ idVehiculo: "veh-1", estado: true, placa: "AAA123", nombreUsuario: "Prueba" }]);
    serviciosMock.mockResolvedValue([{ idServicio: "svc-1", estado: true, nombre: "Lavado", duracionMinutos: 30 }]);
    reservasMock.listar.mockResolvedValueOnce([]).mockRejectedValueOnce(new Error("offline"));
    const { container } = render(<TurnosPage />);
    fireEvent.click(container.querySelector(".gt-btn-nuevo")!);
    await screen.findByText("AAA123 · Prueba");
    fireEvent.change(screen.getByLabelText("Vehículo"), { target: { value: "veh-1" } });
    fireEvent.change(screen.getByLabelText("Servicio"), { target: { value: "svc-1" } });
    fireEvent.change(screen.getByLabelText("Fecha"), { target: { value: "2099-10-01" } });
    fireEvent.change(screen.getByLabelText("Hora"), { target: { value: "09:00" } });
    fireEvent.click(screen.getByRole("button", { name: "Registrar" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("No se pudo comprobar la disponibilidad actual.");
    expect(reservasMock.crear).not.toHaveBeenCalled();
  });

  it("maps the backend past-time rejection to a translated field message", async () => {
    vehiculosMock.mockResolvedValue([{ idVehiculo: "veh-1", estado: true, placa: "AAA123", nombreUsuario: "Prueba" }]);
    serviciosMock.mockResolvedValue([{ idServicio: "svc-1", estado: true, nombre: "Lavado", duracionMinutos: 30 }]);
    reservasMock.crear.mockRejectedValue({ isAxiosError: true, response: { status: 400, data: { error: "La hora elegida ya pasó" } } });
    const { container } = render(<TurnosPage />);
    fireEvent.click(container.querySelector(".gt-btn-nuevo")!);
    await screen.findByText("AAA123 · Prueba");
    fireEvent.change(screen.getByLabelText("Vehículo"), { target: { value: "veh-1" } });
    fireEvent.change(screen.getByLabelText("Servicio"), { target: { value: "svc-1" } });
    fireEvent.change(screen.getByLabelText("Fecha"), { target: { value: "2099-10-01" } });
    fireEvent.change(screen.getByLabelText("Hora"), { target: { value: "09:00" } });
    fireEvent.click(screen.getByRole("button", { name: "Registrar" }));
    const message = await screen.findByText("La hora elegida ya pasó. Selecciona una fecha y hora futuras.");
    expect(message.closest("label")).toHaveAttribute("for", "walk-in-time");
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
    fireEvent.change(screen.getByLabelText("Fecha"), { target: { value: "2099-10-01" } });
    fireEvent.change(screen.getByLabelText("Hora"), { target: { value: "09:00" } });
    fireEvent.click(screen.getByRole("button", { name: "Registrar" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("No se pudo registrar la reserva.");
    expect(alert.closest("form")).toHaveClass("gt-form");
    expect(reservasMock.crear).toHaveBeenCalledWith({
      fkIdVehiculo: "veh-1",
      fkIdServicio: "svc-1",
      fechaReserva: "2099-10-01",
      horaReserva: "09:00:00",
    });
  });

  it("rechaza una hora ocupada del mismo veh?culo", async () => {
    vehiculosMock.mockResolvedValue([{ idVehiculo: "veh-1", estado: true, placa: "AAA123", nombreUsuario: "Prueba" }]);
    serviciosMock.mockResolvedValue([{ idServicio: "svc-1", estado: true, nombre: "Lavado", duracionMinutos: 30 }]);
    reservasMock.listar.mockResolvedValue([{ idVehiculo: "veh-1", fechaReserva: "2099-10-01", horaReserva: "09:00:00", duracionServicio: 30, precioServicio: 30000, estado: "PENDIENTE", nombreUsuario: "Prueba", placaVehiculo: "AAA123" }]);
    const { container } = render(<TurnosPage />);
    fireEvent.click(container.querySelector(".gt-btn-nuevo")!);
    await screen.findByText("AAA123 \u00b7 Prueba");
    fireEvent.change(screen.getByLabelText("Veh\u00edculo"), { target: { value: "veh-1" } });
    fireEvent.change(screen.getByLabelText("Servicio"), { target: { value: "svc-1" } });
    fireEvent.change(screen.getByLabelText("Fecha"), { target: { value: "2099-10-01" } });
    fireEvent.change(screen.getByLabelText("Hora"), { target: { value: "09:15" } });
    fireEvent.click(screen.getByRole("button", { name: "Registrar" }));
    expect(screen.getByText(/ocupada/).closest("label")).toHaveAttribute("for", "walk-in-time");
    expect(reservasMock.crear).not.toHaveBeenCalled();
  });

  it("agrega a Turnos la reserva devuelta por el backend", async () => {
    vehiculosMock.mockResolvedValue([{ idVehiculo: "veh-1", estado: true, placa: "AAA123", nombreUsuario: "Prueba" }]);
    serviciosMock.mockResolvedValue([{ idServicio: "svc-1", estado: true, nombre: "Lavado", duracionMinutos: 30 }]);
    reservasMock.crear.mockResolvedValue({
      idReserva: "reserva-nueva",
      fechaReserva: "2099-10-01",
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
    fireEvent.change(screen.getByLabelText("Fecha"), { target: { value: "2099-10-01" } });
    fireEvent.change(screen.getByLabelText("Hora"), { target: { value: "09:00" } });
    fireEvent.click(screen.getByRole("button", { name: "Registrar" }));

    await waitFor(() => expect(screen.queryByRole("heading", { name: "Reserva presencial" })).not.toBeInTheDocument());
    expect(reservasMock.listar).toHaveBeenCalledTimes(2);
    expect(screen.getByText("AAA123")).toBeInTheDocument();
    expect(screen.getByText("Lavado")).toBeInTheDocument();
    expect(reservasMock.crear).toHaveBeenCalledWith({
      fkIdVehiculo: "veh-1",
      fkIdServicio: "svc-1",
      fechaReserva: "2099-10-01",
      horaReserva: "09:00:00",
    });
  });

  it("does not provide a cancellation action to the reservation detail", async () => {
    reservasMock.listar.mockResolvedValue([{
      idReserva: "reservation-1",
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
      estado: "PENDIENTE",
      createdAt: "2099-09-01T09:00:00",
      updatedAt: "2099-09-01T09:00:00",
      operadorNombre: null,
    }]);

    render(<TurnosPage />);
    fireEvent.click(await screen.findByRole("button", { name: "Ver" }));

    const modalProps = detailModalMock.mock.calls.at(-1)?.[0];
    expect(modalProps).not.toHaveProperty("onCancelar");
    expect(screen.queryByRole("button", { name: "Cancelar reserva" })).not.toBeInTheDocument();
  });
});
