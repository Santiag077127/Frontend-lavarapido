import { useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import axios from "axios";
import { CalendarDays, CheckCircle2, Clock3, DollarSign, TimerReset, XCircle } from "lucide-react";
import { ThemeContext } from "@/theme/theme";
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

const esFechaDelMesActual = (fechaReserva: string) => {
  const [year, month] = fechaReserva.split("-").map(Number);
  const hoy = new Date();

  return year === hoy.getFullYear() && month === hoy.getMonth() + 1;
};

const formatoCOP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const estadoConfig: Record<EstadoReserva, { className: string; label: string }> = {
  PENDIENTE: { className: "badge badge--pendiente", label: "Pendiente" },
  ASIGNADA: { className: "badge badge--pendiente", label: "Asignada" },
  EN_PROCESO: { className: "badge badge--en-proceso", label: "En proceso" },
  FINALIZADA: { className: "badge badge--finalizado", label: "Finalizada" },
  CANCELADA: { className: "badge badge--cancelada", label: "Cancelada" },
};

export const PanelPrincipalPage = () => {
  const theme = useContext(ThemeContext);
  const t = theme?.t ?? ((key: string) => key);
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

  const reservasDelMes = useMemo(
    () => reservas.filter((reserva) => esFechaDelMesActual(reserva.fechaReserva)),
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
  const totalMes = reservasDelMes.length;
  const finalizadosMes = reservasDelMes.filter((reserva) => reserva.estado === "FINALIZADA").length;
  const canceladosMes = reservasDelMes.filter((reserva) => reserva.estado === "CANCELADA").length;
  const pendientesMes = reservasDelMes.filter(
    (reserva) => reserva.estado === "PENDIENTE" || reserva.estado === "ASIGNADA"
  ).length;
  const ingresosMes = reservasDelMes
    .filter((reserva) => reserva.estado === "FINALIZADA")
    .reduce((totalIngresos, reserva) => totalIngresos + Number(reserva.precioServicio || 0), 0);

  return (
    <div className="panel-principal">
      <div className="panel-header">
        <div>
          <p className="panel-eyebrow">{t("panel.eyebrow")}</p>
          <h2 className="panel-titulo">{t("panel.title")}</h2>
          <p className="panel-subtitulo">{t("panel.subtitle")}</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard label={t("panel.inProgressToday")} value={activos} className="stat--azul" icon={<TimerReset size={20} />} />
        <StatCard label={t("panel.pendingToday")} value={pendientes} className="stat--amarillo" icon={<Clock3 size={20} />} />
        <StatCard label={t("panel.finishedToday")} value={finalizados} className="stat--verde" icon={<CheckCircle2 size={20} />} />
        <StatCard label={t("panel.totalToday")} value={total} className="stat--morado" icon={<CalendarDays size={20} />} />
      </div>

      <section className="monthly-summary" aria-label="Estadísticas mensuales">
        <div className="monthly-card monthly-card--primary">
          <span>{t("panel.monthIncome")}</span>
          <strong>{formatoCOP.format(ingresosMes)}</strong>
          <small>{t("panel.monthIncomeNote")}</small>
        </div>
        <div className="monthly-card">
          <span>{t("panel.monthReservations")}</span>
          <strong>{totalMes}</strong>
          <small>{finalizadosMes} {t("panel.finished")}</small>
        </div>
        <div className="monthly-card">
          <span>{t("panel.pendingAssigned")}</span>
          <strong>{pendientesMes}</strong>
          <small>{t("panel.needsFollowUp")}</small>
        </div>
        <div className="monthly-card">
          <span>{t("panel.cancelled")}</span>
          <strong>{canceladosMes}</strong>
          <small>{t("panel.operationalControl")}</small>
        </div>
      </section>

      <section className="admin-strip" aria-label="Indicadores rápidos">
        <div>
          <DollarSign size={18} />
          <span>{t("panel.monthIncome")}</span>
          <strong>{formatoCOP.format(ingresosMes)}</strong>
        </div>
        <div>
          <CheckCircle2 size={18} />
          <span>{t("panel.efficiency")}</span>
          <strong>{totalMes ? Math.round((finalizadosMes / totalMes) * 100) : 0}%</strong>
        </div>
        <div>
          <XCircle size={18} />
          <span>{t("panel.cancellation")}</span>
          <strong>{totalMes ? Math.round((canceladosMes / totalMes) * 100) : 0}%</strong>
        </div>
      </section>

      <div className="panel-section-title">
        <h3>{t("panel.todayOperation")}</h3>
        <p>{t("panel.todayOperationDesc")}</p>
      </div>

      <div className="turnos-card">
        <div className="turnos-card__header">
          <h3 className="turnos-card__titulo">{t("panel.currentTurns")}</h3>
        </div>

        {error && <p className="page-error">{error}</p>}

        <div className="turnos-tabla-wrapper">
          <table className="turnos-tabla">
            <thead>
              <tr>
                {[
                  "#",
                  t("common.client"),
                  t("common.vehicle"),
                  t("common.service"),
                  t("common.operator"),
                  t("common.status"),
                  t("common.time"),
                ].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan={7} className="col-vacio">
                    {t("common.loading")}
                  </td>
                </tr>
              ) : turnosEnCurso.length === 0 ? (
                <tr>
                  <td colSpan={7} className="col-vacio">
                    {t("common.noReservations")}
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
  icon: ReactNode;
}

const StatCard = ({ label, value, className, icon }: StatCardProps) => (
  <div className={`stat-card ${className}`}>
    <span className="stat-card__icon">{icon}</span>
    <p className="stat-card__valor">{value}</p>
    <p className="stat-card__label">{label}</p>
  </div>
);
