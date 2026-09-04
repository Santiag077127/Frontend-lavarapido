import { useState } from "react";
import { CobrarReservaButton } from "../CobrarReservaButton/CobrarReservaButton";
import { ConfirmModal } from "../ConfirmModal/ConfirmModal";
import type { EstadoReserva, Reserva } from "../../services/reservaService";
import "./TurnoDetailModal.css";

interface Props {
  reserva: Reserva;
  onClose: () => void;
  onCambiarEstado: (estado: EstadoReserva) => Promise<void>;
  onCancelar: () => Promise<void>;
  onPagoAprobado: () => Promise<void>;
  onError: (mensaje: string) => void;
}
const LABEL: Record<EstadoReserva, string> = { PENDIENTE: "Pendiente", ASIGNADA: "Asignada", EN_PROCESO: "En proceso", FINALIZADA: "Finalizada", CANCELADA: "Cancelada" };
const NEXT: Partial<Record<EstadoReserva, { estado: EstadoReserva; label: string }>> = { PENDIENTE: { estado: "ASIGNADA", label: "Asignar" }, ASIGNADA: { estado: "EN_PROCESO", label: "Iniciar" }, EN_PROCESO: { estado: "FINALIZADA", label: "Finalizar" } };
const show = (value: string | null | undefined) => value || "—";
const dateTime = (value: string | null) => value ? new Date(value).toLocaleString("es-CO") : "—";

export const TurnoDetailModal = ({ reserva, onClose, onCambiarEstado, onCancelar, onPagoAprobado, onError }: Props) => {
  const [confirmar, setConfirmar] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const siguiente = NEXT[reserva.estado];
  const ejecutar = async (action: () => Promise<void>) => { setProcesando(true); try { await action(); } finally { setProcesando(false); } };

  return <><div className="tdm-overlay" onClick={onClose}><div className="tdm-card" onClick={e => e.stopPropagation()}>
    <div className="tdm-header"><h2>Detalle de reserva</h2><span className={"badge gt-badge-" + reserva.estado}>{LABEL[reserva.estado]}</span></div>
    <section className="tdm-seccion"><h3>Reserva</h3><p className="tdm-secundario">ID: {reserva.idReserva}</p></section>
    <section className="tdm-seccion"><h3>Cliente</h3><p>{show(reserva.nombreUsuario)}</p><p className="tdm-secundario">ID: {reserva.idUsuario}</p></section>
    <section className="tdm-seccion"><h3>Vehículo</h3><p>{show(reserva.placaVehiculo)} · {show(reserva.tipoVehiculo)}</p><p className="tdm-secundario">ID: {reserva.idVehiculo}</p></section>
    <section className="tdm-seccion"><h3>Servicio</h3><p>{show(reserva.nombreServicio)}</p><p className="tdm-secundario">{show(reserva.descripcionServicio)} · ${reserva.precioServicio.toLocaleString("es-CO")} · {reserva.duracionServicio} min<br />ID: {reserva.idServicio}</p></section>
    <section className="tdm-seccion"><h3>Programación</h3><p>{reserva.fechaReserva} · {reserva.horaReserva}</p><p className="tdm-secundario">Inicio: {dateTime(reserva.fechaHoraInicio)}<br />Fin: {dateTime(reserva.fechaHoraFin)}</p></section>
    <section className="tdm-seccion"><h3>Pago</h3><CobrarReservaButton idReserva={reserva.idReserva} habilitado={reserva.estado === "PENDIENTE"} onPagoAprobado={onPagoAprobado} onError={onError} /></section>
    <section className="tdm-seccion"><h3>Registro</h3><p className="tdm-secundario">Creada: {dateTime(reserva.createdAt)}<br />Actualizada: {dateTime(reserva.updatedAt)}</p></section>
    <div className="tdm-acciones"><div>{siguiente && <button className="tdm-btn-asignar" disabled={procesando} onClick={() => ejecutar(() => onCambiarEstado(siguiente.estado))}>{siguiente.label}</button>}{(reserva.estado === "PENDIENTE" || reserva.estado === "ASIGNADA") && <button className="tdm-btn-cancelar" disabled={procesando} onClick={() => setConfirmar(true)}>Cancelar</button>}</div><button className="tdm-btn-cerrar" onClick={onClose}>Cerrar</button></div>
  </div></div>{confirmar && <ConfirmModal titulo="Cancelar reserva" mensaje={`¿Seguro que deseas cancelar la reserva de ${reserva.nombreUsuario}?`} textoConfirmar="Sí, cancelar" textoVolver="Volver" onConfirmar={() => ejecutar(async () => { await onCancelar(); setConfirmar(false); })} onCancelar={() => setConfirmar(false)} />}</>;
};
