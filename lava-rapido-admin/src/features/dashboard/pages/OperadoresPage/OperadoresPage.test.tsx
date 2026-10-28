import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider } from "@/theme/theme";
import { OperadoresPage } from "./OperadoresPage";

const mocks = vi.hoisted(() => ({
  listarOperadores: vi.fn(),
  crearOperador: vi.fn(),
  cambiarEstadoOperador: vi.fn(),
  desactivarTodosOperadores: vi.fn(),
}));

vi.mock("../../services/operadorService", () => ({
  listarOperadores: mocks.listarOperadores,
  crearOperador: mocks.crearOperador,
  cambiarEstadoOperador: mocks.cambiarEstadoOperador,
  desactivarTodosOperadores: mocks.desactivarTodosOperadores,
}));

const operators = (count: number) => Array.from({ length: count }, (_, index) => ({
  idOperador: `operator-${index + 1}`,
  nombre: `Operator ${index + 1}`,
  apellidos: "Test",
  email: `operator${index + 1}@example.com`,
  estado: index % 2 === 0,
  createdAt: null,
}));

const renderPage = () => render(<ThemeProvider><OperadoresPage /></ThemeProvider>);

beforeEach(() => {
  localStorage.clear();
  vi.resetAllMocks();
  mocks.listarOperadores.mockResolvedValue(operators(0));
  mocks.crearOperador.mockImplementation(async (data: { email: string }) => ({
    idOperador: "new-operator",
    nombre: "New",
    apellidos: "Operator",
    email: data.email,
    estado: true,
    createdAt: null,
  }));
});

describe("operator registration capacity", () => {
  it("allows registration with 14 operators and rechecks the list before creating", async () => {
    mocks.listarOperadores
      .mockResolvedValueOnce(operators(14))
      .mockResolvedValueOnce(operators(14));
    renderPage();

    const addButton = await screen.findByRole("button", { name: "+ Nuevo operador" });
    expect(addButton).toBeEnabled();
    expect(screen.getByText("Operadores registrados: 14 de 15")).toBeTruthy();
    fireEvent.click(addButton);
    fireEvent.change(screen.getByLabelText("Correo electrónico *"), { target: { value: "new@example.com" } });
    fireEvent.change(screen.getByLabelText(/Número de documento/), { target: { value: "12345678" } });
    fireEvent.click(screen.getByRole("button", { name: "Asignar operador" }));

    await waitFor(() => expect(mocks.crearOperador).toHaveBeenCalledWith({
      email: "new@example.com", documentNumber: "12345678",
    }));
    expect(mocks.listarOperadores).toHaveBeenCalledTimes(2);
    await waitFor(() => expect(screen.getByText("Operadores registrados: 15 de 15")).toBeTruthy());
  });

  it.each([15, 16])("disables registration when the operator count is %i", async (count) => {
    mocks.listarOperadores.mockResolvedValue(operators(count));
    renderPage();

    expect(await screen.findByText(`Operadores registrados: ${count} de 15`)).toBeTruthy();
    expect(screen.getByRole("button", { name: "+ Nuevo operador" })).toBeDisabled();
    expect(screen.getByRole("status").textContent).toContain("Se alcanzó el límite máximo de 15 operadores.");
    expect(mocks.crearOperador).not.toHaveBeenCalled();
  });

  it("blocks a form that was opened before the refreshed count reaches 15", async () => {
    mocks.listarOperadores
      .mockResolvedValueOnce(operators(14))
      .mockResolvedValueOnce(operators(15));
    renderPage();
    fireEvent.click(await screen.findByRole("button", { name: "+ Nuevo operador" }));
    fireEvent.change(screen.getByLabelText("Correo electrónico *"), { target: { value: "new@example.com" } });
    fireEvent.change(screen.getByLabelText(/Número de documento/), { target: { value: "12345678" } });
    fireEvent.click(screen.getByRole("button", { name: "Asignar operador" }));

    expect((await screen.findAllByText(/Se alcanzó el límite máximo de 15 operadores/)).length).toBeGreaterThan(0);
    expect(mocks.crearOperador).not.toHaveBeenCalled();
  });

  it("does not create when the pre-submit count check fails", async () => {
    mocks.listarOperadores
      .mockResolvedValueOnce(operators(14))
      .mockRejectedValueOnce(new Error("offline"));
    renderPage();
    fireEvent.click(await screen.findByRole("button", { name: "+ Nuevo operador" }));
    fireEvent.change(screen.getByLabelText("Correo electrónico *"), { target: { value: "new@example.com" } });
    fireEvent.change(screen.getByLabelText(/Número de documento/), { target: { value: "12345678" } });
    fireEvent.click(screen.getByRole("button", { name: "Asignar operador" }));

    expect(await screen.findAllByText("No pudimos verificar cuántos operadores están registrados. Inténtalo de nuevo.")).toHaveLength(2);
    expect(mocks.crearOperador).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "+ Nuevo operador" })).toBeDisabled();
  });

  it("loads the initial operator count without exposing manual refresh", async () => {
    mocks.listarOperadores
      .mockResolvedValueOnce(operators(15))
      .mockResolvedValueOnce(operators(14));
    renderPage();
    expect(await screen.findByRole("button", { name: "+ Nuevo operador" })).toBeDisabled();
    expect(screen.queryByRole("button", { name: "Actualizar lista" })).toBeNull();
    expect(mocks.listarOperadores).toHaveBeenCalledTimes(1);
  });

  it("does not enable registration when the initial operator count is unknown", async () => {
    mocks.listarOperadores.mockRejectedValue(new Error("offline"));
    renderPage();

    expect(await screen.findByText("No se pudieron cargar los operadores.")).toBeTruthy();
    expect(screen.getByText("No pudimos consultar el total de operadores.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "+ Nuevo operador" })).toBeDisabled();
  });
});
