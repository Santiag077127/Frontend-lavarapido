// src/features/dashboard/pages/TurnosPage/index.tsx
//
// Página de supervisión de turnos (RF8 del SRS). Sigue el mismo patrón
// de carga que OperadoresPage/PanelPrincipalPage: mock por ahora,
// listo para swap a la API real cuando existan los endpoints.

import { useEffect, useMemo, useState } from "react";
import {
  EstadoReserva,
  OperadorOption,
  Reserva,
  asignarOperador,
  cancelarTurno,
  getOperadoresDisponibles,
  getReservas,
} from "../../services/reservaService";
import { TurnoDetailModal } from "../../components/TurnoDetailModal/TurnoDetailModal";
import "./TurnosPage.css";

type FiltroEstado = EstadoReserva | "todos" | "activos";

const FILTROS: { label: string; value: FiltroEstado }[] = [
  { label: "Activos", value: "activos" },
  { label: "Pendientes", value: "pendiente" },
  { label: "Asignadas", value: "asignada" },
  { label: "En proceso", value: "en_proceso" },
  { label: "Finalizadas", value: "finalizada" },
  { label: "Canceladas", value: "cancelada" },
  { label: "Todos", value: "todos" },
];

const ESTADO_LABEL: Record<EstadoReserva, string> = {
  pendiente: "Pendiente",
  asignada: "Asignada",
  en_proceso: "En proceso",
  finalizada: "Finalizada",
  cancelada: "Cancelada",
};

const ESTADOS_ACTIVOS: EstadoReserva[] = ["pendiente", "asignada", "en_proceso"];

export const TurnosPage = () => {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [operadores, setOperadores] = useState<OperadorOption[]>([]);
  const [cargando, setCargando] = useState(true);
  const [filtro, setFiltro] = useState<FiltroEstado>("activos");
  const [busqueda, setBusqueda] = useState("");
  const [seleccionada, setSeleccionada] = useState<Reserva | null>(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    setCargando(true);
    const [dataReservas, dataOperadores] = await Promise.all([
      getReservas(),
      getOperadoresDisponibles(),
    ]);
    setReservas(dataReservas);
    setOperadores(dataOperadores);
    setCargando(false);
  }

  const stats = useMemo(
    () => ({
      pendiente: reservas.filter((r) => r.estado === "pendiente").length,
      asignada: reservas.filter((r) => r.estado === "asignada").length,
      en_proceso: reservas.filter((r) => r.estado === "en_proceso").length,
      finalizada: reservas.filter((r) => r.estado === "finalizada").length,
    }),
    [reservas]
  );

  const reservasFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return reservas.filter((r) => {
      const coincideEstado =
        filtro === "todos" ||
        (filtro === "activos" && ESTADOS_ACTIVOS.includes(r.estado)) ||
        r.estado === filtro;

      const coincideBusqueda =
        texto === "" ||
        r.cliente.nombre.toLowerCase().includes(texto) ||
        r.vehiculo.placa.toLowerCase().includes(texto);

      return coincideEstado && coincideBusqueda;
    });
  }, [reservas, filtro, busqueda]);

  function aplicarActualizacion(actualizada: Reserva) {
    setReservas((prev) => prev.map((r) => (r.id === actualizada.id ? actualizada : r)));
    setSeleccionada(actualizada);
  }

  async function handleAsignarOperador(reservaId: string, operador: OperadorOption) {
    const actualizada = await asignarOperador(reservaId, operador);
    aplicarActualizacion(actualizada);
  }

  async function handleCancelarTurno(reservaId: string) {
    const actualizada = await cancelarTurno(reservaId);
    aplicarActualizacion(actualizada);
  }

  return (
    <div className="gt-page">
      <div className="gt-header">
        <h1>Turnos</h1>
        <p>Supervisa el estado de los servicios en curso y asigna operadores.</p>
      </div>

      <div className="gt-stats">
        <div className="gt-stat-card gt-stat-pendiente">
          <span className="gt-stat-numero">{stats.pendiente}</span>
          <span className="gt-stat-label">Pendientes</span>
        </div>
        <div className="gt-stat-card gt-stat-asignada">
          <span className="gt-stat-numero">{stats.asignada}</span>
          <span className="gt-stat-label">Asignadas</span>
        </div>
        <div className="gt-stat-card gt-stat-proceso">
          <span className="gt-stat-numero">{stats.en_proceso}</span>
          <span className="gt-stat-label">En proceso</span>
        </div>
        <div className="gt-stat-card gt-stat-finalizada">
          <span className="gt-stat-numero">{stats.finalizada}</span>
          <span className="gt-stat-label">Finalizadas</span>
        </div>
      </div>

      <div className="gt-controles">
        <div className="gt-filtros">
          {FILTROS.map((f) => (
            <button
              key={f.value}
              className={`gt-filtro-btn ${filtro === f.value ? "gt-filtro-activo" : ""}`}
              onClick={() => setFiltro(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <input
          className="gt-busqueda"
          type="text"
          placeholder="Buscar por cliente o placa..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      <div className="gt-tabla-wrapper">
        <table className="gt-tabla">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Vehículo</th>
              <th>Servicio</th>
              <th>Hora</th>
              <th>Operador</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {cargando && (
              <tr>
                <td colSpan={7} className="gt-vacio">
                  Cargando turnos...
                </td>
              </tr>
            )}
            {!cargando && reservasFiltradas.length === 0 && (
              <tr>
                <td colSpan={7} className="gt-vacio">
                  No hay turnos para este filtro.
                </td>
              </tr>
            )}
            {!cargando &&
              reservasFiltradas.map((r) => (
                <tr key={r.id}>
                  <td>{r.cliente.nombre}</td>
                  <td>{r.vehiculo.placa}</td>
                  <td>{r.servicio.nombre}</td>
                  <td>{r.hora}</td>
                  <td>{r.operador ? r.operador.nombre : "—"}</td>
                  <td>
                    <span className={`badge gt-badge-${r.estado}`}>
                      {ESTADO_LABEL[r.estado]}
                    </span>
                  </td>
                  <td>
                    <button className="gt-btn-ver" onClick={() => setSeleccionada(r)}>
                      Ver
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {seleccionada && (
        <TurnoDetailModal
          reserva={seleccionada}
          operadoresDisponibles={operadores}
          onClose={() => setSeleccionada(null)}
          onAsignarOperador={handleAsignarOperador}
          onCancelarTurno={handleCancelarTurno}
        />
      )}
    </div>
  );
};
