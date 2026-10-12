import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({ listar: vi.fn(), contar: vi.fn(), leer: vi.fn(), leerTodas: vi.fn() }));
vi.mock("../../services/notificacionService", () => ({ notificacionesApi: api }));
import { NotificacionesPage } from "./NotificacionesPage";

const empty = { content: [], number: 0, size: 10, totalElements: 0, totalPages: 0 };
const show = () => render(<MemoryRouter><NotificacionesPage /></MemoryRouter>);

describe("NotificacionesPage", () => {
  beforeEach(() => { vi.clearAllMocks(); api.contar.mockResolvedValue(0); api.listar.mockResolvedValue(empty); });

  it("muestra carga y lista vacía", async () => {
    let finish!: (value: typeof empty) => void;
    api.listar.mockReturnValue(new Promise(resolve => { finish = resolve; }));
    show();
    expect(screen.getByText("Cargando notificaciones…")).toBeInTheDocument();
    finish(empty);
    expect(await screen.findByText("Aún no hay notificaciones.")).toBeInTheDocument();
  });

  it("permite reintentar después de un error", async () => {
    api.listar.mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce(empty);
    show();
    expect(await screen.findByRole("alert")).toHaveTextContent("No se pudieron cargar");
    fireEvent.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(await screen.findByText("Aún no hay notificaciones.")).toBeInTheDocument();
  });

  it("marca una notificación propia y actualiza el contador", async () => {
    api.contar.mockResolvedValueOnce(1).mockResolvedValueOnce(0);
    api.listar.mockResolvedValueOnce({ ...empty, content: [{
      id: "n-1", tipo: "booking", titulo: "Reserva creada", mensaje: "Pendiente",
      reservaId: "r-1", pagoId: null, leidaAt: null, createdAt: "2026-10-11T12:00:00",
    }], totalElements: 1, totalPages: 1 }).mockResolvedValueOnce(empty);
    api.leer.mockResolvedValue({});
    show();
    fireEvent.click(await screen.findByRole("button", { name: "Marcar como leída" }));
    await waitFor(() => expect(api.leer).toHaveBeenCalledWith("n-1"));
    expect(await screen.findByText("0 sin leer")).toBeInTheDocument();
  });
});
