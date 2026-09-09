import { useState } from "react";
import axios from "axios";
import { CobrarReservaButton } from "../CobrarReservaButton/CobrarReservaButton";
import { ConfirmModal } from "../ConfirmModal/ConfirmModal";
import { crearAsignacion, listarOperadores, type Operador } from "../../services/operadorService";
import type { EstadoReserva, Reserva } from "../../services/reservaService";
import "./TurnoDetailModal.css";

interface Props { reserva: Reserva; onClose: () => void; onCambiarEstado: (estado: EstadoReserva) => Promise<void>; onCancelar: () => Promise<void>; onPagoAprobado: () => Promise<void>; onAsignado: () => Promise<void>; onError: (mensaje: string) => void; }
const LABEL: Record<EstadoReserva, string> = { PENDIENTE: "Pendiente", ASIGNADA: "Asignada", EN_PROCESO: "En proceso", FINALIZADA: "Finalizada", CANCELADA: "Cancelada" };
const NEXT: Partial<Record<EstadoReserva, { estado: EstadoReserva; label: string }>> = { ASIGNADA: { estado: "EN_PROCESO", label: "Iniciar" }, EN_PROCESO: { estado: "FINALIZADA", label: "Finalizar" } };
const show = (value: string | null | undefined) => value || "—";
const dateTime = (value: string | null) => value ? new Date(value).toLocaleString("es-CO") : "—";
const errorMessage = (error: unknown, fallback: string) => axios.isAxiosError(error) ? error.response?.data?.error ?? fallback : fallback;

export const TurnoDetailModal = ({ reserva, onClose, onCambiarEstado, onCancelar, onPagoAprobado, onAsignado, onError }: Props) => {
  const [confirmar, setConfirmar] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [asignando, setAsignando] = useState(false);
  const [selectorAbierto, setSelectorAbierto] = useState(false);
  const [operadores, setOperadores] = useState<Operador[]>([]);
  const [operadorId, setOperadorId] = useState("");
  const siguiente = NEXT[reserva.estado];
  const tieneAsignacion = Boolean(reserva.idAsignacion ?? reserva.asignacion?.idAsignacion);
  const puedeAsignar = (reserva.estado === "PENDIENTE" || reserva.estado === "ASIGNADA") && !tieneAsignacion;
  const ejecutar = async (action: () => Promise<void>) => { setProcesando(true); try { await action(); } finally { setProcesando(false); } };
  const abrirAsignacion = async () => { setAsignando(true); try { const data = await listarOperadores(); setOperadores(data.filter(op => op.estado)); setSelectorAbierto(true); } catch (e) { onError(errorMessage(e, "No se pudieron cargar los operadores.")); } finally { setAsignando(false); } };
  const confirmarAsignacion = async () => { if (!operadorId) { onError("Selecciona un operador."); return; } setAsignando(true); try { await crearAsignacion({ idReserva: reserva.idReserva, idOperador: operadorId }); setSelectorAbierto(false); await onAsignado(); } catch (e) { onError(errorMessage(e, "No se pudo asignar el operador.")); } finally { setAsignando(false); } };

  return <><div className="tdm-overlay" onClick={onClose}><div className="tdm-card" onClick={e => e.stopPropagation()}>
    <div className="tdm-header"><h2>Detalle de reserva</h2><span className={"badge gt-badge-" + reserva.estado}>{LABEL[reserva.estado]}</span></div>
    <section className="tdm-seccion"><h3>Reserva</h3><p className="tdm-secundario">ID: {reserva.idReserva}</p></section>
    <section className="tdm-seccion"><h3>Cliente</h3><p>{show(reserva.nombreUsuario)}</p><p className="tdm-secundario">ID: {reserva.idUsuario}</p></section>
    <section className="tdm-seccion"><h3>Vehículo</h3><p>{show(reserva.placaVehiculo)} · {show(reserva.tipoVehiculo)}</p><p className="tdm-secundario">ID: {reserva.idVehiculo}</p></section>
    <section className="tdm-seccion"><h3>Servicio</h3><p>{show(reserva.nombreServicio)}</p><p className="tdm-secundario">{show(reserva.descripcionServicio)} · ${reserva.precioServicio.toLocaleString("es-CO")} · {reserva.duracionServicio} min<br />ID: {reserva.idServicio}</p></section>
    <section className="tdm-seccion"><h3>Programación</h3><p>{reserva.fechaReserva} · {reserva.horaReserva}</p><p className="tdm-secundario">Inicio: {dateTime(reserva.fechaHoraInicio)}<br />Fin: {dateTime(reserva.fechaHoraFin)}</p></section>
    <section className="tdm-seccion"><h3>Pago</h3><CobrarReservaButton idReserva={reserva.idReserva} habilitado={reserva.estado === "PENDIENTE"} onPagoAprobado={onPagoAprobado} onError={onError} /></section>
    {puedeAsignar && <section className="tdm-seccion"><h3>Operador</h3>{selectorAbierto ? <><label className="tdm-secundario">Operador activo<select value={operadorId} onChange={e => setOperadorId(e.target.value)} disabled={asignando}><option value="">Seleccionar operador...</option>{operadores.map(op => <option key={op.idOperador} value={op.idOperador}>{op.nombre} · {op.email}</option>)}</select></label><div className="tdm-acciones"><button className="tdm-btn-cerrar" disabled={asignando} onClick={() => setSelectorAbierto(false)}>Cancelar</button><button className="tdm-btn-asignar" disabled={asignando || !operadorId} onClick={confirmarAsignacion}>{asignando ? "Asignando..." : "Confirmar asignación"}</button></div></> : <button className="tdm-btn-asignar" disabled={asignando} onClick={abrirAsignacion}>{asignando ? "Cargando..." : "Asignar operador"}</button>}</section>}
    <section className="tdm-seccion"><h3>Registro</h3><p className="tdm-secundario">Creada: {dateTime(reserva.createdAt)}<br />Actualizada: {dateTime(reserva.updatedAt)}</p></section>
    <div className="tdm-acciones"><div>{siguiente && <button className="tdm-btn-asignar" disabled={procesando} onClick={() => ejecutar(() => onCambiarEstado(siguiente.estado))}>{siguiente.label}</button>}{(reserva.estado === "PENDIENTE" || reserva.estado === "ASIGNADA") && <button className="tdm-btn-cancelar" disabled={procesando} onClick={() => setConfirmar(true)}>Cancelar</button>}</div><button className="tdm-btn-cerrar" onClick={onClose}>Cerrar</button></div>
  </div></div>{confirmar && <ConfirmModal titulo="Cancelar reserva" mensaje={`¿Seguro que deseas cancelar la reserva de ${reserva.nombreUsuario}?`} textoConfirmar="Sí, cancelar" textoVolver="Volver" onConfirmar={() => ejecutar(async () => { await onCancelar(); setConfirmar(false); })} onCancelar={() => setConfirmar(false)} />}</>;
};
