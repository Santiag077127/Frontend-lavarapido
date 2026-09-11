import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { listarReservas, type EstadoReserva, type Reserva } from "../../services/reservaService";
import "./PanelPrincipalPage.css";

const errorMessage = (error: unknown, fallback: string) =>
  axios.isAxiosError(error)
    ? error.response?.data?.error ||
      (error.response?.status === 403 ? "No tienes permiso para realizar esta acción." : fallback)
    : fallback;

const esFechaDeHoy = (fechaReserva: string) => {
  const [year, month, day] = fechaReserva.split("-").map(Number);
  const fecha = new Date(year, month - 1, day);
  const hoy = new Date();

  return (
    fecha.getFullYear() === hoy.getFullYear() &&
    fecha.getMonth() === hoy.getMonth() &&
    fecha.getDate() === hoy.getDate()
  );
};

const estadoConfig: Record<EstadoReserva, { className: string; label: string }> = {
  PENDIENTE: { className: "badge badge--pendiente", label: "Pendiente" },
  ASIGNADA: { className: "badge badge--pendiente", label: "Asignada" },
  EN_PROCESO: { className: "badge badge--en-proceso", label: "En proceso" },
  FINALIZADA: { className: "badge badge--finalizado", label: "Finalizada" },
  CANCELADA: { className: "badge badge--cancelada", label: "Cancelada" },
};

export const PanelPrincipalPage = () => {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarReservas = async () => {
    setCargando(true);
    setError(null);

    try {
      const data = await listarReservas();
      setReservas(data);
    } catch (e) {
      setError(errorMessage(e, "No se pudieron cargar las reservas."));
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    void cargarReservas();
  }, []);

  const reservasDeHoy = useMemo(
    () => reservas.filter((reserva) => esFechaDeHoy(reserva.fechaReserva)),
    [reservas]
  );

  const turnosEnCurso = useMemo(
    () =>
      reservasDeHoy
        .filter((reserva) => reserva.estado !== "CANCELADA")
        .sort((a, b) => a.horaReserva.localeCompare(b.horaReserva)),
    [reservasDeHoy]
  );

  const activos = turnosEnCurso.filter((reserva) => reserva.estado === "EN_PROCESO").length;
  const pendientes = turnosEnCurso.filter(
    (reserva) => reserva.estado === "PENDIENTE" || reserva.estado === "ASIGNADA"
  ).length;
  const finalizados = turnosEnCurso.filter((reserva) => reserva.estado === "FINALIZADA").length;
  const total = turnosEnCurso.length;

  return (
    <div className="panel-principal">
      <div className="panel-header">
        <h2 className="panel-titulo">Panel principal</h2>
        <p className="panel-subtitulo">Resumen de operaciones del día</p>
      </div>

      <div className="stats-grid">
        <StatCard label="Servicios activos" value={activos} className="stat--azul" />
        <StatCard label="Pendientes" value={pendientes} className="stat--amarillo" />
        <StatCard label="Finalizados hoy" value={finalizados} className="stat--verde" />
        <StatCard label="Total del día" value={total} className="stat--morado" />
      </div>

      <div className="turnos-card">
        <div className="turnos-card__header">
          <h3 className="turnos-card__titulo">Turnos en curso</h3>
        </div>

        {error && <p className="page-error">{error}</p>}

        <div className="turnos-tabla-wrapper">
          <table className="turnos-tabla">
            <thead>
              <tr>
                {[
                  "#",
                  "Cliente",
                  "Vehículo",
                  "Servicio",
                  "Operador",
                  "Estado",
                  "Hora",
                ].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan={7} className="col-vacio">
                    Cargando reservas...
                  </td>
                </tr>
              ) : turnosEnCurso.length === 0 ? (
                <tr>
                  <td colSpan={7} className="col-vacio">
                    No hay reservas para mostrar.
                  </td>
                </tr>
              ) : (
                turnosEnCurso.map((reserva, index) => (
                  <tr key={reserva.idReserva}>
                    <td className="col-num">{index + 1}</td>
                    <td className="col-cliente">{reserva.nombreUsuario}</td>
                    <td className="col-vehiculo">{reserva.placaVehiculo}</td>
                    <td>{reserva.nombreServicio}</td>
                    <td className={reserva.operadorNombre ? "col-operador" : "col-operador col-operador--muted"}>
                      {reserva.operadorNombre || "Sin asignar"}
                    </td>
                    <td>
                      <span className={estadoConfig[reserva.estado].className}>
                        {estadoConfig[reserva.estado].label}
                      </span>
                    </td>
                    <td className="col-hora">{reserva.horaReserva}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: number;
  className: string;
}

const StatCard = ({ label, value, className }: StatCardProps) => (
  <div className={`stat-card ${className}`}>
    <p className="stat-card__valor">{value}</p>
    <p className="stat-card__label">{label}</p>
  </div>
);