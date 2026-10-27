// Muestra detalles de la reserva y acciones de estado, asignación y pago.
import { useRef, useState } from "react";
import axios from "axios";
import { useLocale, useTranslations } from "@/theme/theme";
import { CobrarReservaButton } from "../CobrarReservaButton/CobrarReservaButton";
import { countActiveReservationsForOperator, crearAsignacion, listarOperadores, type Operador } from "../../services/operadorService";
import { listarReservas, type EstadoReserva, type Reserva } from "../../services/reservaService";
import "./TurnoDetailModal.css";

interface Props { reserva: Reserva; onClose: () => void; onCambiarEstado: (estado: EstadoReserva) => Promise<void>; onPagoAprobado: () => Promise<void>; onAsignado: () => Promise<void>; onError: (mensaje: string) => void; }
const LABEL: Record<EstadoReserva, string> = { PENDIENTE: "common.pending", ASIGNADA: "common.assigned", EN_PROCESO: "common.inProgress", FINALIZADA: "common.finished", CANCELADA: "common.cancelled" };
const NEXT: Partial<Record<EstadoReserva, { estado: EstadoReserva; label: string }>> = { ASIGNADA: { estado: "EN_PROCESO", label: "ui.iniciar" }, EN_PROCESO: { estado: "FINALIZADA", label: "ui.finalizar" } };
const show = (value: string | null | undefined) => value || "—";
const dateTime = (value: string | null, locale: string) => value ? new Date(value).toLocaleString(locale) : "—";
const errorMessage = (error: unknown, fallback: string) => axios.isAxiosError(error) && error.response?.status === 403 ? "ui.no.tienes.permiso.para.realizar.esta.accion" : fallback;

export const TurnoDetailModal = ({ reserva, onClose, onCambiarEstado, onPagoAprobado, onAsignado, onError }: Props) => {
  const t = useTranslations();
  const locale = useLocale();
  const [procesando, setProcesando] = useState(false);
  const [asignando, setAsignando] = useState(false);
  const [selectorAbierto, setSelectorAbierto] = useState(false);
  const [advertenciaAbierta, setAdvertenciaAbierta] = useState(false);
  const [operadores, setOperadores] = useState<Operador[]>([]);
  const [operadorId, setOperadorId] = useState("");
  const assignmentInFlight = useRef(false);
  const siguiente = NEXT[reserva.estado];
  const tieneAsignacion = Boolean(reserva.operadorNombre || reserva.idAsignacion || reserva.asignacion?.idAsignacion);
  const puedeAsignar = (reserva.estado === "PENDIENTE" || reserva.estado === "ASIGNADA") && !tieneAsignacion;
  const ejecutar = async (action: () => Promise<void>) => { setProcesando(true); try { await action(); } finally { setProcesando(false); } };
  const abrirAsignacion = async () => {
    setAsignando(true);
    try {
      const data = await listarOperadores();
      setOperadores(data);
      setOperadorId("");
      setAdvertenciaAbierta(false);
      setSelectorAbierto(true);
    } catch (e) {
      onError(errorMessage(e, "ui.no.se.pudieron.cargar.los.operadores"));
    } finally {
      setAsignando(false);
    }
  };

  const verificarAsignacionesActivas = async () => {
    const [freshOperators, reservations] = await Promise.all([listarOperadores(), listarReservas()]);
    const activeCount = countActiveReservationsForOperator(
      operadorId,
      freshOperators,
      reservations,
      reserva.idReserva,
    );
    if (activeCount === null) throw new Error("turns.assignmentCheckAmbiguous");
    return activeCount;
  };

  const verificarYAsignar = async (confirmed: boolean) => {
    if (!operadorId) { onError("ui.selecciona.un.operador"); return; }
    if (assignmentInFlight.current) return;
    assignmentInFlight.current = true;
    setAsignando(true);
    try {
      let activeCount: number;
      try {
        activeCount = await verificarAsignacionesActivas();
      } catch (e) {
        onError(e instanceof Error && e.message === "turns.assignmentCheckAmbiguous"
          ? "turns.assignmentCheckAmbiguous"
          : "turns.assignmentCheckFailed");
        return;
      }
      if (activeCount > 0 && !confirmed) {
        setAdvertenciaAbierta(true);
        return;
      }
      await crearAsignacion({ idReserva: reserva.idReserva, idOperador: operadorId });
      setAdvertenciaAbierta(false);
      setSelectorAbierto(false);
      await onAsignado();
    } catch (e) {
      onError(errorMessage(e, "ui.no.se.pudo.asignar.el.operador"));
    } finally {
      assignmentInFlight.current = false;
      setAsignando(false);
    }
  };

  return <><div className="tdm-overlay" onClick={onClose}><div className="tdm-card" onClick={e => e.stopPropagation()}>
    <div className="tdm-header"><h2>{t("ui.detalle.de.reserva")}</h2><span className={"badge gt-badge-" + reserva.estado}>{t(LABEL[reserva.estado])}</span></div>
    <section className="tdm-seccion"><h3>{t("common.client")}</h3><p>{show(reserva.nombreUsuario)}</p></section>
    <section className="tdm-seccion"><h3>{t("common.vehicle")}</h3><p>{show(reserva.placaVehiculo)} · {show(reserva.tipoVehiculo)}</p></section>
    <section className="tdm-seccion"><h3>{t("common.service")}</h3><p>{show(reserva.nombreServicio)}</p><p className="tdm-secundario">{show(reserva.descripcionServicio)} · ${reserva.precioServicio.toLocaleString(locale)} · {reserva.duracionServicio} min</p></section>
    <section className="tdm-seccion"><h3>{t("ui.programacion")}</h3><p>{reserva.fechaReserva} · {reserva.horaReserva}</p><p className="tdm-secundario">{t("ui.inicio") + " "}{dateTime(reserva.fechaHoraInicio, locale)}<br />{t("ui.fin") + " "}{dateTime(reserva.fechaHoraFin, locale)}</p></section>
    <section className="tdm-seccion"><h3>{t("turns.payment")}</h3><CobrarReservaButton idReserva={reserva.idReserva} estadoReserva={reserva.estado} habilitado={reserva.estado === "PENDIENTE"} mostrarActualizarEstado={false} onPagoAprobado={onPagoAprobado} onError={onError} /></section>
    {(puedeAsignar || tieneAsignacion) && <section className="tdm-seccion"><h3>{t("common.operator")}</h3>{tieneAsignacion ? <p>{reserva.operadorNombre || t("ui.operador.asignado")}</p> : selectorAbierto ? <><label className="tdm-secundario">{t("ui.operador.activo")}<select value={operadorId} onChange={e => { setOperadorId(e.target.value); setAdvertenciaAbierta(false); }} disabled={asignando}><option value="">{t("ui.seleccionar.operador")}</option>{operadores.filter(op => op.estado).map(op => <option key={op.idOperador} value={op.idOperador}>{op.nombre} · {op.email}</option>)}</select></label>{asignando && <p className="tdm-checking" role="status">{t("turns.checkingOperatorServices")}</p>}{advertenciaAbierta ? <div className="tdm-assignment-warning" role="alert"><p>{t("turns.multipleActiveWarning")}</p><div className="tdm-assignment-warning__actions"><button className="tdm-btn-cerrar" disabled={asignando} onClick={() => setAdvertenciaAbierta(false)}>{t("common.cancel")}</button><button className="tdm-btn-asignar" disabled={asignando} onClick={() => verificarYAsignar(true)}>{asignando ? t("turns.checkingOperatorServices") : t("turns.continueAssignment")}</button></div></div> : <div className="tdm-acciones"><button className="tdm-btn-cerrar" disabled={asignando} onClick={() => { setAdvertenciaAbierta(false); setSelectorAbierto(false); }}>{t("common.cancel")}</button><button className="tdm-btn-asignar" disabled={asignando || !operadorId} onClick={() => verificarYAsignar(false)}>{asignando ? t("turns.checkingOperatorServices") : t("ui.confirmar.asignacion")}</button></div>}</> : <button className="tdm-btn-asignar" disabled={asignando} onClick={abrirAsignacion}>{asignando ? t("common.loading") : t("operators.assign")}</button>}</section>}
    <section className="tdm-seccion"><h3>{t("ui.registro")}</h3><p className="tdm-secundario">{t("ui.creada") + " "}{dateTime(reserva.createdAt, locale)}<br />{t("ui.actualizada") + " "}{dateTime(reserva.updatedAt, locale)}</p></section>
    <div className="tdm-acciones"><div>{siguiente && <button className="tdm-btn-asignar" disabled={procesando} onClick={() => ejecutar(() => onCambiarEstado(siguiente.estado))}>{t(siguiente.label)}</button>}</div><button className="tdm-btn-cerrar" onClick={onClose}>{t("ui.cerrar")}</button></div>
  </div></div></>;
};
