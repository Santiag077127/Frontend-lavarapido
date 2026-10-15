// Muestra detalles de la reserva y acciones de estado, asignación y pago.
import { useState } from "react";
import axios from "axios";
import { formatTranslation, useLocale, useTranslations } from "@/theme/theme";
import { CobrarReservaButton } from "../CobrarReservaButton/CobrarReservaButton";
import { ConfirmModal } from "../ConfirmModal/ConfirmModal";
import { crearAsignacion, listarOperadores, type Operador } from "../../services/operadorService";
import type { EstadoReserva, Reserva } from "../../services/reservaService";
import "./TurnoDetailModal.css";

interface Props { reserva: Reserva; onClose: () => void; onCambiarEstado: (estado: EstadoReserva) => Promise<void>; onCancelar: () => Promise<void>; onPagoAprobado: () => Promise<void>; onAsignado: () => Promise<void>; onError: (mensaje: string) => void; }
const LABEL: Record<EstadoReserva, string> = { PENDIENTE: "common.pending", ASIGNADA: "common.assigned", EN_PROCESO: "common.inProgress", FINALIZADA: "common.finished", CANCELADA: "common.cancelled" };
const NEXT: Partial<Record<EstadoReserva, { estado: EstadoReserva; label: string }>> = { ASIGNADA: { estado: "EN_PROCESO", label: "ui.iniciar" }, EN_PROCESO: { estado: "FINALIZADA", label: "ui.finalizar" } };
const show = (value: string | null | undefined) => value || "—";
const dateTime = (value: string | null, locale: string) => value ? new Date(value).toLocaleString(locale) : "—";
const errorMessage = (error: unknown, fallback: string) => axios.isAxiosError(error) && error.response?.status === 403 ? "ui.no.tienes.permiso.para.realizar.esta.accion" : fallback;

export const TurnoDetailModal = ({ reserva, onClose, onCambiarEstado, onCancelar, onPagoAprobado, onAsignado, onError }: Props) => {
  const t = useTranslations();
  const locale = useLocale();
  const [confirmar, setConfirmar] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [asignando, setAsignando] = useState(false);
  const [selectorAbierto, setSelectorAbierto] = useState(false);
  const [operadores, setOperadores] = useState<Operador[]>([]);
  const [operadorId, setOperadorId] = useState("");
  const siguiente = NEXT[reserva.estado];
  const tieneAsignacion = Boolean(reserva.operadorNombre || reserva.idAsignacion || reserva.asignacion?.idAsignacion);
  const puedeAsignar = (reserva.estado === "PENDIENTE" || reserva.estado === "ASIGNADA") && !tieneAsignacion;
  const ejecutar = async (action: () => Promise<void>) => { setProcesando(true); try { await action(); } finally { setProcesando(false); } };
  const abrirAsignacion = async () => { setAsignando(true); try { const data = await listarOperadores(); setOperadores(data.filter(op => op.estado)); setSelectorAbierto(true); } catch (e) { onError(errorMessage(e, "ui.no.se.pudieron.cargar.los.operadores")); } finally { setAsignando(false); } };
  const confirmarAsignacion = async () => { if (!operadorId) { onError("ui.selecciona.un.operador"); return; } setAsignando(true); try { await crearAsignacion({ idReserva: reserva.idReserva, idOperador: operadorId }); setSelectorAbierto(false); await onAsignado(); } catch (e) { onError(errorMessage(e, "ui.no.se.pudo.asignar.el.operador")); } finally { setAsignando(false); } };

  return <><div className="tdm-overlay" onClick={onClose}><div className="tdm-card" onClick={e => e.stopPropagation()}>
    <div className="tdm-header"><h2>{t("ui.detalle.de.reserva")}</h2><span className={"badge gt-badge-" + reserva.estado}>{t(LABEL[reserva.estado])}</span></div>
    <section className="tdm-seccion"><h3>{t("ui.reserva")}</h3><p className="tdm-secundario">ID: {reserva.idReserva}</p></section>
    <section className="tdm-seccion"><h3>{t("common.client")}</h3><p>{show(reserva.nombreUsuario)}</p><p className="tdm-secundario">ID: {reserva.idUsuario}</p></section>
    <section className="tdm-seccion"><h3>{t("common.vehicle")}</h3><p>{show(reserva.placaVehiculo)} · {show(reserva.tipoVehiculo)}</p><p className="tdm-secundario">ID: {reserva.idVehiculo}</p></section>
    <section className="tdm-seccion"><h3>{t("common.service")}</h3><p>{show(reserva.nombreServicio)}</p><p className="tdm-secundario">{show(reserva.descripcionServicio)} · ${reserva.precioServicio.toLocaleString(locale)} · {reserva.duracionServicio} min<br />ID: {reserva.idServicio}</p></section>
    <section className="tdm-seccion"><h3>{t("ui.programacion")}</h3><p>{reserva.fechaReserva} · {reserva.horaReserva}</p><p className="tdm-secundario">{t("ui.inicio") + " "}{dateTime(reserva.fechaHoraInicio, locale)}<br />{t("ui.fin") + " "}{dateTime(reserva.fechaHoraFin, locale)}</p></section>
    <section className="tdm-seccion"><h3>{t("turns.payment")}</h3><CobrarReservaButton idReserva={reserva.idReserva} estadoReserva={reserva.estado} habilitado={reserva.estado === "PENDIENTE"} onPagoAprobado={onPagoAprobado} onError={onError} /></section>
    {(puedeAsignar || tieneAsignacion) && <section className="tdm-seccion"><h3>{t("common.operator")}</h3>{tieneAsignacion ? <p>{reserva.operadorNombre || t("ui.operador.asignado")}</p> : selectorAbierto ? <><label className="tdm-secundario">{t("ui.operador.activo")}<select value={operadorId} onChange={e => setOperadorId(e.target.value)} disabled={asignando}><option value="">{t("ui.seleccionar.operador")}</option>{operadores.map(op => <option key={op.idOperador} value={op.idOperador}>{op.nombre} · {op.email}</option>)}</select></label><div className="tdm-acciones"><button className="tdm-btn-cerrar" disabled={asignando} onClick={() => setSelectorAbierto(false)}>{t("common.cancel")}</button><button className="tdm-btn-asignar" disabled={asignando || !operadorId} onClick={confirmarAsignacion}>{asignando ? t("operators.assigning") : t("ui.confirmar.asignacion")}</button></div></> : <button className="tdm-btn-asignar" disabled={asignando} onClick={abrirAsignacion}>{asignando ? t("common.loading") : t("operators.assign")}</button>}</section>}
    <section className="tdm-seccion"><h3>{t("ui.registro")}</h3><p className="tdm-secundario">{t("ui.creada") + " "}{dateTime(reserva.createdAt, locale)}<br />{t("ui.actualizada") + " "}{dateTime(reserva.updatedAt, locale)}</p></section>
    <div className="tdm-acciones"><div>{siguiente && <button className="tdm-btn-asignar" disabled={procesando} onClick={() => ejecutar(() => onCambiarEstado(siguiente.estado))}>{t(siguiente.label)}</button>}{(reserva.estado === "PENDIENTE" || reserva.estado === "ASIGNADA") && <button className="tdm-btn-cancelar" disabled={procesando} onClick={() => setConfirmar(true)}>{t("common.cancel")}</button>}</div><button className="tdm-btn-cerrar" onClick={onClose}>{t("ui.cerrar")}</button></div>
  </div></div>{confirmar && <ConfirmModal titulo={t("booking.cancelTitle")} mensaje={formatTranslation(t("booking.cancelPrompt"), { name: reserva.nombreUsuario })} textoConfirmar={t("booking.yesCancel")} textoVolver={t("common.back")} onConfirmar={() => ejecutar(async () => { await onCancelar(); setConfirmar(false); })} onCancelar={() => setConfirmar(false)} />}</>;
};
