import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { EstadoReserva, Reserva } from "../../services/reservaService";
import { TurnoDetailModal } from "./TurnoDetailModal";

const assignmentMocks = vi.hoisted(() => ({
  listarOperadores: vi.fn(),
  listarReservas: vi.fn(),
  crearAsignacion: vi.fn(),
}));

vi.mock("../CobrarReservaButton/CobrarReservaButton", () => ({
  CobrarReservaButton: () => <div>Controles de pago</div>,
}));

vi.mock("../../services/operadorService", async (importOriginal) => ({
  ...await importOriginal<typeof import("../../services/operadorService")>(),
  listarOperadores: assignmentMocks.listarOperadores,
  crearAsignacion: assignmentMocks.crearAsignacion,
}));

vi.mock("../../services/reservaService", async (importOriginal) => ({
  ...await importOriginal<typeof import("../../services/reservaService")>(),
  listarReservas: assignmentMocks.listarReservas,
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

const operator = { idOperador: "operator-1", nombre: "Ana", apellidos: "Uno", email: "ana@example.com", estado: true, createdAt: null };
const assignedReservation = (idReserva: string, estado: EstadoReserva, operadorNombre = "Ana Uno") => ({
  ...reservation(estado), idReserva, operadorNombre,
});

const callbacks = {
  onClose: vi.fn(),
  onCambiarEstado: vi.fn().mockResolvedValue(undefined),
  onPagoAprobado: vi.fn().mockResolvedValue(undefined),
  onAsignado: vi.fn().mockResolvedValue(undefined),
  onError: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  assignmentMocks.listarOperadores.mockResolvedValue([operator]);
  assignmentMocks.listarReservas.mockResolvedValue([]);
  assignmentMocks.crearAsignacion.mockResolvedValue({ idAsignacion: "assignment-1" });
  callbacks.onAsignado.mockResolvedValue(undefined);
});

const openAssignmentSelector = async () => {
  fireEvent.click(screen.getByRole("button", { name: "Asignar operador" }));
  const select = await screen.findByLabelText("Operador activo");
  fireEvent.change(select, { target: { value: operator.idOperador } });
  return select;
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

  it("assigns normally when the operator has no active reservations", async () => {
    render(<TurnoDetailModal reserva={reservation("PENDIENTE")} {...callbacks} />);
    await openAssignmentSelector();
    fireEvent.click(screen.getByRole("button", { name: "Confirmar asignación" }));

    await waitFor(() => expect(assignmentMocks.crearAsignacion).toHaveBeenCalledWith({
      idReserva: "reservation-PENDIENTE", idOperador: operator.idOperador,
    }));
    expect(assignmentMocks.listarReservas).toHaveBeenCalledTimes(1);
    expect(callbacks.onAsignado).toHaveBeenCalledTimes(1);
  });

  it("warns for one or several active services and lets the administrator cancel", async () => {
    assignmentMocks.listarReservas.mockResolvedValue([
      assignedReservation("active-pending", "PENDIENTE"),
      assignedReservation("active-assigned", "ASIGNADA"),
      assignedReservation("active-progress", "EN_PROCESO"),
    ]);
    render(<TurnoDetailModal reserva={reservation("PENDIENTE")} {...callbacks} />);
    await openAssignmentSelector();
    fireEvent.click(screen.getByRole("button", { name: "Confirmar asignación" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Este operador ya tiene un servicio pendiente o en proceso. ¿Deseas asignarle otro servicio?",
    );
    expect(assignmentMocks.crearAsignacion).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(assignmentMocks.crearAsignacion).not.toHaveBeenCalled();
  });

  it("rechecks before continuing and then creates the assignment", async () => {
    assignmentMocks.listarReservas
      .mockResolvedValueOnce([assignedReservation("active-1", "ASIGNADA")])
      .mockResolvedValueOnce([assignedReservation("active-1", "ASIGNADA")]);
    render(<TurnoDetailModal reserva={reservation("PENDIENTE")} {...callbacks} />);
    await openAssignmentSelector();
    fireEvent.click(screen.getByRole("button", { name: "Confirmar asignación" }));
    fireEvent.click(await screen.findByRole("button", { name: "Continuar asignación" }));

    await waitFor(() => expect(assignmentMocks.crearAsignacion).toHaveBeenCalledTimes(1));
    expect(assignmentMocks.listarReservas).toHaveBeenCalledTimes(2);
    expect(callbacks.onAsignado).toHaveBeenCalledTimes(1);
  });

  it("does not warn for finished or cancelled services", async () => {
    assignmentMocks.listarReservas.mockResolvedValue([
      assignedReservation("finished", "FINALIZADA"),
      assignedReservation("cancelled", "CANCELADA"),
    ]);
    render(<TurnoDetailModal reserva={reservation("PENDIENTE")} {...callbacks} />);
    await openAssignmentSelector();
    fireEvent.click(screen.getByRole("button", { name: "Confirmar asignación" }));

    await waitFor(() => expect(assignmentMocks.crearAsignacion).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("does not assign when the reservation check fails", async () => {
    assignmentMocks.listarReservas.mockRejectedValue(new Error("offline"));
    render(<TurnoDetailModal reserva={reservation("PENDIENTE")} {...callbacks} />);
    await openAssignmentSelector();
    fireEvent.click(screen.getByRole("button", { name: "Confirmar asignación" }));

    await waitFor(() => expect(callbacks.onError).toHaveBeenCalledWith("turns.assignmentCheckFailed"));
    expect(assignmentMocks.crearAsignacion).not.toHaveBeenCalled();
  });

  it("does not assign when operator names are ambiguous in the available data", async () => {
    assignmentMocks.listarOperadores.mockResolvedValue([
      operator,
      { ...operator, idOperador: "operator-2" },
    ]);
    render(<TurnoDetailModal reserva={reservation("PENDIENTE")} {...callbacks} />);
    await openAssignmentSelector();
    fireEvent.click(screen.getByRole("button", { name: "Confirmar asignación" }));

    await waitFor(() => expect(callbacks.onError).toHaveBeenCalledWith("turns.assignmentCheckAmbiguous"));
    expect(assignmentMocks.crearAsignacion).not.toHaveBeenCalled();
  });

  it("prevents duplicate assignment submissions while checking", async () => {
    let finishCheck!: (value: Reserva[]) => void;
    assignmentMocks.listarReservas.mockImplementationOnce(() => new Promise(resolve => { finishCheck = resolve; }));
    render(<TurnoDetailModal reserva={reservation("PENDIENTE")} {...callbacks} />);
    await openAssignmentSelector();
    const confirmButton = screen.getByRole("button", { name: "Confirmar asignación" });
    fireEvent.click(confirmButton);
    fireEvent.click(confirmButton);

    expect(assignmentMocks.listarReservas).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("status")).toHaveTextContent("Verificando servicios del operador...");
    finishCheck([]);
    await waitFor(() => expect(assignmentMocks.crearAsignacion).toHaveBeenCalledTimes(1));
  });
});
