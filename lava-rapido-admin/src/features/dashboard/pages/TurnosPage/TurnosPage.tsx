// Lista reservas y permite registrar reservas presenciales y gestionar turnos.
import { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { ThemeContext, localizeMessage, useLocale, useTranslations } from "@/theme/theme";
import { CobrarReservaButton } from "../../components/CobrarReservaButton/CobrarReservaButton";
import { TurnoDetailModal } from "../../components/TurnoDetailModal/TurnoDetailModal";
import { getServiciosDisponibles } from "../../services/servicioService";
import { cambiarEstado, crearReserva, listarReservas, type EstadoReserva, type Reserva } from "../../services/reservaService";
import { getVehiculos } from "../../services/vehiculoService";
import type { Servicio, Vehiculo } from "../../types";
import { getBogotaDateTime, getMinimumReservationDate, getWalkInFieldErrors, hasVehicleReservationConflict, type WalkInField, type WalkInForm } from "./reservationValidation";
import "./TurnosPage.css";

type FiltroEstado = EstadoReserva | "TODOS" | "ACTIVOS";
const FILTROS: { labelKey: string; value: FiltroEstado }[] = [{ labelKey: "turns.active", value: "ACTIVOS" }, { labelKey: "turns.pendingPlural", value: "PENDIENTE" }, { labelKey: "turns.assignedPlural", value: "ASIGNADA" }, { labelKey: "turns.inProgress", value: "EN_PROCESO" }, { labelKey: "turns.finishedPlural", value: "FINALIZADA" }, { labelKey: "turns.cancelledPlural", value: "CANCELADA" }, { labelKey: "common.all", value: "TODOS" }];
const ACTIVOS: EstadoReserva[] = ["PENDIENTE", "ASIGNADA", "EN_PROCESO"];
const EMPTY_FORM: WalkInForm = { vehiculo: "", servicio: "", fecha: "", hora: "" };
const errorMessage = (error: unknown, fallback: string) => axios.isAxiosError(error) && error.response?.status === 403 ? "ui.no.tienes.permiso.para.realizar.esta.accion" : fallback;

export const TurnosPage = () => {
  const theme = useContext(ThemeContext);
  const t = useTranslations();
  const locale = useLocale();
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<FiltroEstado>("ACTIVOS");
  const [busqueda, setBusqueda] = useState("");
  const [seleccionada, setSeleccionada] = useState<Reserva | null>(null);
  const [formAbierto, setFormAbierto] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitFieldErrors, setSubmitFieldErrors] = useState<Partial<Record<WalkInField, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<WalkInField, boolean>>>({});
  const [form, setForm] = useState<WalkInForm>(EMPTY_FORM);
  const [guardando, setGuardando] = useState(false);
  const [now, setNow] = useState(() => new Date());

  const cargar = async () => {
    setCargando(true);
    setError(null);
    try {
      const [r, v, s] = await Promise.all([listarReservas(), getVehiculos(), getServiciosDisponibles()]);
      setReservas(r);
      setVehiculos(v);
      setServicios(s);
      const objetivo = new URLSearchParams(window.location.search).get("reserva");
      if (objetivo) {
        setFiltro("TODOS");
        setSeleccionada(r.find((item) => item.idReserva === objetivo) ?? null);
      }
    } catch (e) {
      setError(errorMessage(e, "ui.no.se.pudieron.cargar.las.reservas"));
    } finally {
      setCargando(false);
    }
  };

  const refrescarReservas = async () => {
    try {
      const data = await listarReservas();
      setReservas(data);
      setSeleccionada((actual) => actual ? data.find((r) => r.idReserva === actual.idReserva) ?? null : null);
    } catch (e) {
      setError(errorMessage(e, "ui.no.se.pudieron.actualizar.las.reservas"));
    }
  };

  useEffect(() => { void cargar(); }, []);
  useEffect(() => {
    if (!formAbierto) return;
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, [formAbierto]);

  const stats = useMemo(() => Object.fromEntries(["PENDIENTE", "ASIGNADA", "EN_PROCESO", "FINALIZADA"].map((estado) => [estado, reservas.filter((r) => r.estado === estado).length])) as Record<string, number>, [reservas]);
  const filtradas = useMemo(() => {
    const text = busqueda.trim().toLowerCase();
    return reservas.filter((r) => (filtro === "TODOS" || (filtro === "ACTIVOS" && ACTIVOS.includes(r.estado)) || r.estado === filtro)
      && (!text || r.nombreUsuario.toLowerCase().includes(text) || r.placaVehiculo.toLowerCase().includes(text)));
  }, [reservas, filtro, busqueda]);
  const servicioSeleccionado = servicios.find((item) => item.idServicio === form.servicio);
  const today = getBogotaDateTime(now);
  const minimumDate = getMinimumReservationDate(now);
  const errors = getWalkInFieldErrors(form, servicioSeleccionado?.duracionMinutos, now);
  Object.assign(errors, submitFieldErrors);
  if (!errors.hora && servicioSeleccionado && form.vehiculo && form.fecha && form.hora
    && hasVehicleReservationConflict(form, servicioSeleccionado.duracionMinutos, reservas)) {
    errors.hora = "turns.occupiedTime";
  }

  const actualizar = (reserva: Reserva) => { setReservas((prev) => prev.map((item) => item.idReserva === reserva.idReserva ? reserva : item)); setSeleccionada(reserva); };
  const cambiar = async (estado: EstadoReserva) => {
    if (!seleccionada) return;
    try { actualizar(await cambiarEstado(seleccionada.idReserva, estado)); }
    catch (e) { setError(errorMessage(e, "ui.no.se.pudo.cambiar.el.estado")); }
  };

  const resetFormulario = () => {
    setForm(EMPTY_FORM);
    setFormError(null);
    setSubmitFieldErrors({});
    setTouched({});
    setGuardando(false);
    setNow(new Date());
  };
  const abrirFormulario = () => { resetFormulario(); setFormAbierto(true); };
  const cerrarFormulario = () => { if (guardando) return; resetFormulario(); setFormAbierto(false); };
  const cambiarCampo = (field: WalkInField, value: string) => {
    const next = { ...form, [field]: value };
    setForm(next);
    setFormError(null);
    setSubmitFieldErrors({});
    const nextTouched = { ...touched, [field]: true };
    if (field === "fecha" && form.hora) nextTouched.hora = true;
    if (field === "servicio" && form.hora) nextTouched.hora = true;
    setTouched(nextTouched);
  };

  const guardar = async (event: React.FormEvent) => {
    event.preventDefault();
    if (guardando) return;
    const currentErrors = getWalkInFieldErrors(form, servicioSeleccionado?.duracionMinutos, new Date());
    setTouched({ vehiculo: true, servicio: true, fecha: true, hora: true });
    setFormError(null);
    setSubmitFieldErrors({});
    if (Object.keys(currentErrors).length || !servicioSeleccionado) return;
    setGuardando(true);
    try {
      let latestReservations: Reserva[];
      try {
        latestReservations = await listarReservas();
      } catch {
        setFormError("turns.availabilityCheckFailed");
        return;
      }
      setReservas(latestReservations);
      if (hasVehicleReservationConflict(form, servicioSeleccionado.duracionMinutos, latestReservations)) {
        return;
      }
      const nueva = await crearReserva({ fkIdVehiculo: form.vehiculo, fkIdServicio: form.servicio, fechaReserva: form.fecha, horaReserva: `${form.hora}:00` });
      setReservas((previous) => [nueva, ...previous]);
      resetFormulario();
      setFormAbierto(false);
    } catch (requestError) {
      const detail = axios.isAxiosError(requestError) ? requestError.response?.data?.error : undefined;
      if (axios.isAxiosError(requestError) && requestError.response?.status === 400 && typeof detail === "string") {
        if (detail.toLowerCase().includes("pas")) setSubmitFieldErrors({ hora: "turns.pastTime" });
        else if (detail.toLowerCase().includes("solapad")) setSubmitFieldErrors({ hora: "turns.occupiedTime" });
        else if (detail.includes("06:00") || detail.includes("20:00")) setSubmitFieldErrors({ hora: "turns.outsideBusinessHours" });
        else setFormError("ui.no.se.pudo.registrar.la.reserva");
      } else {
        setFormError(errorMessage(requestError, "ui.no.se.pudo.registrar.la.reserva"));
      }
    } finally {
      setGuardando(false);
    }
  };

  const labelEstado: Record<EstadoReserva, string> = { PENDIENTE: t("common.pending"), ASIGNADA: t("common.assigned"), EN_PROCESO: t("common.inProgress"), FINALIZADA: t("common.finished"), CANCELADA: t("common.cancelled") };
  const selectedDuration = servicioSeleccionado?.duracionMinutos ?? 0;
  const latestTime = form.fecha === today.date ? today.time : "06:00";
  const minTime = latestTime > "06:00" ? latestTime : "06:00";
  const maxStartMinute = Math.max(0, 20 * 60 - selectedDuration);
  const maxTime = `${String(Math.floor(maxStartMinute / 60)).padStart(2, "0")}:${String(maxStartMinute % 60).padStart(2, "0")}`;

  return <div className="gt-page">
    <div className="gt-header"><div><h1>{t("turns.title")}</h1><p>{t("turns.subtitle")}</p></div><button className="gt-btn-nuevo" onClick={abrirFormulario}>+ {t("turns.newWalkIn")}</button></div>
    <div className="gt-stats">{[["PENDIENTE", t("turns.pendingPlural"), "pendiente"], ["ASIGNADA", t("turns.assignedPlural"), "asignada"], ["EN_PROCESO", t("turns.inProgress"), "proceso"], ["FINALIZADA", t("turns.finishedPlural"), "finalizada"]].map(([key, label, css]) => <div key={key} className={"gt-stat-card gt-stat-" + css}><span className="gt-stat-numero">{stats[key]}</span><span className="gt-stat-label">{label}</span></div>)}</div>
    <div className="gt-controles"><div className="gt-filtros">{FILTROS.map((item) => <button key={item.value} className={"gt-filtro-btn " + (filtro === item.value ? "gt-filtro-activo" : "")} onClick={() => setFiltro(item.value)}>{t(item.labelKey)}</button>)}</div><input className="gt-busqueda" placeholder={t("turns.search")} value={busqueda} onChange={(event) => setBusqueda(event.target.value)} /></div>
    {error && <p className="page-error">{localizeMessage(error, t)}</p>}
    <div className="gt-tabla-wrapper"><table className="gt-tabla"><thead><tr><th>{t("common.dateTime")}</th><th>{t("ui.placa")}</th><th>{t("common.client")}</th><th>{t("common.service")}</th><th>{t("common.status")}</th><th>{t("common.duration")}</th><th>{t("common.price")}</th><th>{t("turns.payment")}</th><th /></tr></thead><tbody>{cargando ? <tr><td colSpan={9} className="gt-vacio">{t("common.loading")}</td></tr> : filtradas.length === 0 ? <tr><td colSpan={9} className="gt-vacio">{t("common.noReservations")}</td></tr> : filtradas.map((item) => <tr key={item.idReserva}><td>{item.fechaReserva}<br />{item.horaReserva}</td><td>{item.placaVehiculo}</td><td>{item.nombreUsuario}</td><td>{item.nombreServicio}</td><td><span className={"badge gt-badge-" + item.estado}>{labelEstado[item.estado]}</span></td><td>{item.duracionServicio} min</td><td>${item.precioServicio.toLocaleString(locale)}</td><td><CobrarReservaButton idReserva={item.idReserva} estadoReserva={item.estado} habilitado={item.estado === "PENDIENTE"} compacto onPagoAprobado={refrescarReservas} onError={setError} /></td><td><button className="gt-btn-ver" onClick={() => setSeleccionada(item)}>{t("turns.view")}</button></td></tr>)}</tbody></table></div>
    {seleccionada && <TurnoDetailModal reserva={seleccionada} onClose={() => setSeleccionada(null)} onCambiarEstado={cambiar} onPagoAprobado={refrescarReservas} onAsignado={refrescarReservas} onError={setError} />}
    {formAbierto && <div className="tdm-overlay"><form className="tdm-card gt-form" onSubmit={guardar} noValidate><div className="tdm-header"><h2>{t("ui.reserva.presencial")}</h2></div>
      <label htmlFor="walk-in-vehicle">{t("common.vehicle")}<select id="walk-in-vehicle" required value={form.vehiculo} onChange={(event) => cambiarCampo("vehiculo", event.target.value)} disabled={guardando}><option value="">{t("ui.seleccionar.vehiculo")}</option>{vehiculos.filter((vehicle) => vehicle.estado).map((vehicle) => <option key={vehicle.idVehiculo} value={vehicle.idVehiculo}>{vehicle.placa} · {vehicle.nombreUsuario}</option>)}</select>{touched.vehiculo && errors.vehiculo && <small className="gt-field-error">{localizeMessage(errors.vehiculo, t)}</small>}</label>
      <label htmlFor="walk-in-service">{t("common.service")}<select id="walk-in-service" required value={form.servicio} onChange={(event) => cambiarCampo("servicio", event.target.value)} disabled={guardando}><option value="">{t("ui.seleccionar.servicio")}</option>{servicios.filter((service) => service.estado).map((service) => <option key={service.idServicio} value={service.idServicio}>{service.nombre} · {service.duracionMinutos} min</option>)}</select>{touched.servicio && errors.servicio && <small className="gt-field-error">{localizeMessage(errors.servicio, t)}</small>}</label>
      <label htmlFor="walk-in-date">{t("ui.fecha")}<input id="walk-in-date" type="date" min={minimumDate} required value={form.fecha} onChange={(event) => cambiarCampo("fecha", event.target.value)} onBlur={() => setTouched((current) => ({ ...current, fecha: true }))} disabled={guardando} />{touched.fecha && errors.fecha && <small className="gt-field-error">{localizeMessage(errors.fecha, t)}</small>}</label>
      <label htmlFor="walk-in-time">{t("common.time")}<input id="walk-in-time" type="time" min={minTime} max={maxTime} step={60} required value={form.hora} onChange={(event) => cambiarCampo("hora", event.target.value)} onBlur={() => setTouched((current) => ({ ...current, hora: true }))} disabled={guardando} />{touched.hora && errors.hora && <small className="gt-field-error">{localizeMessage(errors.hora, t)}</small>}</label>
      {formError && <p className="page-error" role="alert">{localizeMessage(formError, t)}</p>}
      <div className="tdm-acciones"><button type="button" className="tdm-btn-cerrar" onClick={cerrarFormulario} disabled={guardando}>{t("common.cancel")}</button><button className="tdm-btn-asignar" disabled={guardando}>{guardando ? t("profile.saving") : t("ui.registrar")}</button></div>
    </form></div>}
  </div>;
};
