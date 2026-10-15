// Inicia Wompi y consulta el estado del pago hasta obtener confirmación.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useTranslations, useLocale, localizeMessage } from "@/theme/theme";
import { useAuthStore } from "@/store/authStore";
import {
  consultarPago,
  iniciarPago,
  reconciliarPago,
  verificarTransaccion,
  type Pago,
  type PagoIntento,
} from "../../services/pagoService";
import { guardarContextoPago } from "../../services/pagoContext";
import {
  crearConfiguracionWidget,
  liberarFlujoWompi,
  reservarFlujoWompi,
  useWompiWidget,
} from "../../hooks/useWompiWidget";
import type { EstadoReserva } from "../../services/reservaService";
import "./CobrarReservaButton.css";

interface Props {
  idReserva: string;
  habilitado: boolean;
  estadoReserva?: EstadoReserva;
  compacto?: boolean;
  autoVerificar?: boolean;
  onPagoAprobado: () => Promise<void> | void;
  onError: (mensaje: string) => void;
}

const POLL_INTERVAL_MS = 4_000;
const POLL_MAX_DURATION_MS = 120_000;

const mensajePagoError = (error: unknown, accion: "consultar" | "iniciar" | "reconciliar") => {
  if (!axios.isAxiosError(error)) return "payments.failedAction";
  if (!error.response) return "ui.no.hay.conexion.con.el.servidor.conservamos.el.pago.como.pendient";
  switch (error.response.status) {
    case 401: return "ui.tu.sesion.expiro.inicia.sesion.para.continuar.la.consulta.del.pag";
    case 403: return accion === "reconciliar" ? "ui.solo.un.administrador.puede.verificar.el.pago.con.wompi" : "ui.no.tienes.acceso.a.este.pago";
    case 404: return "ui.no.se.encontro.informacion.de.pago.para.esta.reserva";
    case 409: return accion === "reconciliar"
      ? "ui.no.existe.un.intento.pendiente.elegible.para.verificar.con.wompi"
      : "ui.el.pago.no.se.puede.iniciar.en.el.estado.actual.de.la.reserva.o.e";
    case 422: return "ui.wompi.devolvio.datos.incompatibles.el.pago.requiere.revision.admi";
    case 502: return "ui.wompi.no.esta.disponible.en.este.momento.intenta.verificar.mas.ta";
    default: return "ui.no.fue.posible.completar.la.operacion.de.pago.intenta.de.nuevo.ma";
  }
};

const formatoDinero = (valor: number, locale: string) => new Intl.NumberFormat(locale, {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
}).format(valor);

const formatoFecha = (valor: string | null | undefined, locale: string) => valor
  ? new Date(valor).toLocaleString(locale)
  : "ui.sin.confirmar";

const etiquetaMetodo = (valor: string | null | undefined) => {
  if (!valor) return "ui.por.confirmar";
  const conocidos: Record<string, string> = { CARD: "ui.tarjeta", NEQUI: "Nequi", PSE: "PSE", BANCOLOMBIA_TRANSFER: "ui.transferencia.bancolombia" };
  return conocidos[valor.toUpperCase()] ?? valor.replace(/_/g, " ");
};

const etiquetaIntento = (intento: PagoIntento) => ({
  pendiente: "payments.status.pending",
  aprobado: "payments.status.approved",
  rechazado: "payments.status.rejected",
  aprobado_duplicado: "ui.posible.cobro.duplicado",
}[intento.estado]);

export const CobrarReservaButton = ({
  idReserva,
  habilitado,
  estadoReserva,
  compacto = false,
  autoVerificar = false,
  onPagoAprobado,
  onError,
}: Props) => {
  const t = useTranslations();
  const locale = useLocale();
  const { listo, cargando: cargandoScript, error: errorScript, reintentar: reintentarScript } = useWompiWidget();
  const esAdmin = useAuthStore((state) => state.user?.role === "ADMIN");
  const [pago, setPago] = useState<Pago | null>(null);
  const [consultando, setConsultando] = useState(true);
  const [iniciando, setIniciando] = useState(false);
  const [verificando, setVerificando] = useState(false);
  const [reconciliando, setReconciliando] = useState(false);
  const [esperaAgotada, setEsperaAgotada] = useState(false);
  const [consultaError, setConsultaError] = useState<string | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const pollControllerRef = useRef<AbortController | null>(null);
  const pollRunRef = useRef(0);
  const mountedRef = useRef(true);
  const pagoPrevioRef = useRef<Pago["estado"] | null>(null);
  const onPagoAprobadoRef = useRef(onPagoAprobado);
  const onErrorRef = useRef(onError);
  onPagoAprobadoRef.current = onPagoAprobado;
  onErrorRef.current = onError;

  const detenerPolling = useCallback(() => {
    pollRunRef.current += 1;
    pollControllerRef.current?.abort();
    pollControllerRef.current = null;
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
    if (mountedRef.current) setVerificando(false);
  }, []);

  const guardarPago = useCallback(async (resultado: Pago) => {
    setPago(resultado);
    setConsultaError(null);
    if (resultado.estado === "aprobado" && pagoPrevioRef.current !== "aprobado") await onPagoAprobadoRef.current();
    pagoPrevioRef.current = resultado.estado;
    return resultado;
  }, []);

  const consultar = useCallback(async (signal?: AbortSignal) => {
    const resultado = await consultarPago(idReserva, signal);
    return guardarPago(resultado);
  }, [guardarPago, idReserva]);

  // Consulta al backend hasta obtener un estado final o agotar el tiempo de espera.
  const iniciarVerificacion = useCallback(() => {
    detenerPolling();
    const run = pollRunRef.current;
    const inicio = Date.now();
    setVerificando(true);
    setEsperaAgotada(false);

    const siguiente = async () => {
      if (!mountedRef.current || run !== pollRunRef.current) return;
      try {
        const controller = new AbortController();
        pollControllerRef.current = controller;
        const resultado = await consultar(controller.signal);
        pollControllerRef.current = null;
        if (!mountedRef.current || run !== pollRunRef.current) return;
        if (resultado.estado !== "pendiente") {
          detenerPolling();
          return;
        }
        if (Date.now() - inicio >= POLL_MAX_DURATION_MS) {
          detenerPolling();
          setEsperaAgotada(true);
          return;
        }
        timeoutRef.current = window.setTimeout(siguiente, POLL_INTERVAL_MS);
      } catch (error) {
        if (!mountedRef.current || run !== pollRunRef.current || axios.isCancel(error)) return;
        detenerPolling();
        const mensaje = mensajePagoError(error, "consultar");
        setConsultaError(mensaje);
        onErrorRef.current(mensaje);
      }
    };

    void siguiente();
  }, [consultar, detenerPolling]);

  useEffect(() => {
    mountedRef.current = true;
    const controller = new AbortController();
    detenerPolling();
    pagoPrevioRef.current = null;
    setConsultando(true);
    setPago(null);
    setConsultaError(null);
    consultar(controller.signal)
      .then((resultado) => {
        if (autoVerificar && resultado.estado === "pendiente") iniciarVerificacion();
      })
      .catch((error) => {
        if (axios.isCancel(error)) return;
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          setPago(null);
          setConsultaError(null);
          return;
        }
        const mensaje = mensajePagoError(error, "consultar");
        setConsultaError(mensaje);
        onErrorRef.current(mensaje);
      })
      .finally(() => mountedRef.current && setConsultando(false));
    return () => {
      mountedRef.current = false;
      controller.abort();
      pollControllerRef.current?.abort();
      pollControllerRef.current = null;
      pollRunRef.current += 1;
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    };
  }, [autoVerificar, consultar, detenerPolling, idReserva, iniciarVerificacion]);

  const refrescarUnaVez = async () => {
    detenerPolling();
    setConsultando(true);
    setEsperaAgotada(false);
    try { await consultar(); }
    catch (error) {
      const mensaje = mensajePagoError(error, "consultar");
      setConsultaError(mensaje);
      onErrorRef.current(mensaje);
    } finally { if (mountedRef.current) setConsultando(false); }
  };

  // El backend prepara la referencia y la firma antes de abrir el widget.
  const cobrar = async () => {
    if (!listo || iniciando) return;
    if (!reservarFlujoWompi(idReserva)) {
      onErrorRef.current("ui.ya.hay.un.pago.de.wompi.abierto.o.iniciandose.finalizalo.o.espera");
      return;
    }
    setIniciando(true);
    setConsultaError(null);
    try {
      const config = await iniciarPago(idReserva);
      const Checkout = window.WidgetCheckout;
      if (!Checkout) throw new Error("ui.wompi.no.esta.disponible");
      guardarContextoPago({ idReserva, referencia: config.referencia });
      const checkout = new Checkout(crearConfiguracionWidget(config));
      // El resultado del widget inicia la verificación; no confirma el pago por sí solo.
      checkout.open((result) => {
        liberarFlujoWompi(idReserva);
        const transactionId = result?.transaction?.id;
        if (!transactionId) {
          iniciarVerificacion();
          return;
        }
        void verificarTransaccion(idReserva, config.referencia, transactionId)
          .then(guardarPago)
          .catch((error) => onErrorRef.current(mensajePagoError(error, "consultar")))
          .finally(iniciarVerificacion);
      });
    } catch (error) {
      liberarFlujoWompi(idReserva);
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        try {
          const actualizado = await consultar();
          if (actualizado.estado === "aprobado") return;
        } catch {
          // El mensaje del conflicto sigue siendo más seguro que exponer el body del servidor.
        }
      }
      onErrorRef.current(mensajePagoError(error, "iniciar"));
    } finally { if (mountedRef.current) setIniciando(false); }
  };

  const reconciliar = async () => {
    if (reconciliando) return;
    setReconciliando(true);
    try {
      await reconciliarPago(idReserva);
      await consultar();
    } catch (error) {
      onErrorRef.current(mensajePagoError(error, "reconciliar"));
    } finally { if (mountedRef.current) setReconciliando(false); }
  };

  const tieneDuplicado = useMemo(() => pago?.intentos.some((intento) => intento.estado === "aprobado_duplicado") ?? false, [pago]);
  const intentoPendiente = pago ? [...pago.intentos].reverse().find((intento) => intento.estado === "pendiente") ?? null : null;
  const puedePagar = habilitado && (!pago || pago.estado === "rechazado" || pago.estado === "pendiente");

  if (consultando && !pago) return <span className="pago-estado">{t("ui.consultando.pago")}</span>;
  if (consultaError && !pago) return <span className="pago-error">{localizeMessage(consultaError, t)} <button type="button" className="pago-refrescar" onClick={refrescarUnaVez}>{t("ui.reintentar.consulta")}</button></span>;
  if (errorScript && puedePagar) return <span className="pago-error">{t("ui.no.se.pudo.cargar.wompi") + " "}<button type="button" className="pago-refrescar" onClick={reintentarScript}>{t("ui.reintentar")}</button></span>;

  if (compacto) {
    return <div className="pago-compacto">
      {pago?.estado === "aprobado" && <span className="badge pago-aprobado">{t("ui.pagado")}</span>}
      {pago?.estado === "rechazado" && <span className="badge pago-rechazado">{t("ui.rechazado")}</span>}
      {pago?.estado === "pendiente" && <span className="badge pago-pendiente">{t("common.pending")}</span>}
      {tieneDuplicado && <span className="pago-incidencia-mini" title={t("ui.posible.doble.cobro")}>{t("ui.revisar")}</span>}
      {pago?.estado === "pendiente" && <button type="button" className="pago-refrescar" disabled={verificando} onClick={iniciarVerificacion}>{verificando ? t("payments.verifying") : t("payments.check")}</button>}
      {puedePagar && pago?.estado !== "aprobado" && <button type="button" className="pago-btn pago-btn--compacto" disabled={!listo || iniciando || cargandoScript} onClick={cobrar}>{iniciando ? t("payments.opening") : pago ? t("payments.continue") : t("payments.charge")}</button>}
    </div>;
  }

  return <div className="pago-panel">
    <div className="pago-resumen">
      <div><span className="pago-label">{t("ui.estado.financiero")}</span><strong className={`pago-valor pago-valor--${pago?.estado ?? "sin-pago"}`}>{pago ? t(`payments.status.${pago.estado === "aprobado" ? "approved" : pago.estado === "rechazado" ? "rejected" : "pending"}`) : t("ui.sin.iniciar")}</strong></div>
      <div><span className="pago-label">{t("ui.estado.operativo")}</span><strong className="pago-valor">{estadoReserva ? t(({ PENDIENTE: "common.pending", ASIGNADA: "common.assigned", EN_PROCESO: "common.inProgress", FINALIZADA: "common.finished", CANCELADA: "common.cancelled" } as Record<EstadoReserva, string>)[estadoReserva]) : t("ui.consultar.reserva")}</strong></div>
      {pago && <div><span className="pago-label">{t("ui.monto")}</span><strong className="pago-valor">{formatoDinero(pago.monto, locale)}</strong></div>}
      {pago && <div><span className="pago-label">{t("ui.metodo.real")}</span><strong className="pago-valor">{localizeMessage(etiquetaMetodo(pago.intentoActual?.wompiPaymentMethodType), t)}</strong></div>}
    </div>

    {pago?.intentoActual && <p className="pago-detalle">{t("ui.referencia") + " "}<code>{pago.intentoActual.referencia}</code><br />{t("ui.confirmacion") + " "}{localizeMessage(formatoFecha(pago.fechaPago ?? pago.intentoActual.fechaConfirmacion, locale), t)}</p>}
    {pago?.estado === "aprobado" && estadoReserva === "PENDIENTE" && <p className="pago-aviso">{t("ui.pago.confirmado.la.reserva.sigue.pendiente.de.asignacion")}</p>}
    {pago?.estado === "aprobado" && estadoReserva === "CANCELADA" && <p className="pago-incidencia">{t("ui.la.reserva.continua.cancelada.pero.recibio.una.aprobacion.tardia")}</p>}
    {tieneDuplicado && <p className="pago-incidencia">{t("ui.posible.doble.cobro.detectado.revisa.los.intentos.no.se.ha.prome")}</p>}
    {esperaAgotada && <p className="pago-aviso">{t("ui.pago.pendiente.de.confirmacion.puedes.consultar.de.nuevo.sin.ini")}</p>}
    {verificando && <p className="pago-estado">{t("ui.consultando.confirmacion.del.backend")}</p>}

    <div className="pago-acciones">
      {pago?.estado === "pendiente" && <button type="button" className="pago-btn-secundario" disabled={verificando || consultando} onClick={iniciarVerificacion}>{verificando ? t("payments.verifying") : esperaAgotada ? t("ui.consultar.de.nuevo") : t("ui.actualizar.estado")}</button>}
      {puedePagar && pago?.estado !== "aprobado" && <button type="button" className="pago-btn" disabled={!listo || iniciando || cargandoScript} onClick={cobrar}>{iniciando ? t("ui.abriendo.wompi") : pago?.estado === "rechazado" ? t("ui.reintentar.pago") : pago?.estado === "pendiente" ? t("ui.continuar.en.wompi") : t("ui.pagar.con.wompi")}</button>}
      {esAdmin && intentoPendiente?.wompiTransactionId && <button type="button" className="pago-btn-secundario" disabled={reconciliando} onClick={reconciliar}>{reconciliando ? t("payments.verifying") : t("ui.verificar.con.wompi")}</button>}
    </div>
    {esAdmin && intentoPendiente && !intentoPendiente.wompiTransactionId && <p className="pago-ayuda">{t("ui.la.verificacion.automatica.no.esta.disponible.hasta.que.exista.u")}</p>}

    {pago && pago.intentos.length > 0 && <details className="pago-historial"><summary>{t("ui.historial.de.intentos")}{pago.intentos.length})</summary><ol>{pago.intentos.map((intento) => <li key={intento.idIntento} className={intento.estado === "aprobado_duplicado" ? "pago-intento--incidencia" : ""}><strong>{localizeMessage(etiquetaIntento(intento), t)}</strong> · {localizeMessage(etiquetaMetodo(intento.wompiPaymentMethodType), t)}<br /><span>{intento.referencia} · {localizeMessage(formatoFecha(intento.fechaConfirmacion ?? intento.createdAt, locale), t)}</span></li>)}</ol></details>}
  </div>;
};
