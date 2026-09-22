import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useAuthStore } from "@/store/authStore";
import {
  consultarPago,
  iniciarPago,
  reconciliarPago,
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
  if (!axios.isAxiosError(error)) return `No se pudo ${accion} el pago.`;
  if (!error.response) return "No hay conexión con el servidor. Conservamos el pago como pendiente hasta poder verificarlo.";
  switch (error.response.status) {
    case 401: return "Tu sesión expiró. Inicia sesión para continuar la consulta del pago.";
    case 403: return accion === "reconciliar" ? "Solo un administrador puede verificar el pago con Wompi." : "No tienes acceso a este pago.";
    case 404: return "No se encontró información de pago para esta reserva.";
    case 409: return accion === "reconciliar"
      ? "No existe un intento pendiente elegible para verificar con Wompi."
      : "El pago no se puede iniciar en el estado actual de la reserva o el precio cambió.";
    case 422: return "Wompi devolvió datos incompatibles. El pago requiere revisión administrativa.";
    case 502: return "Wompi no está disponible en este momento. Intenta verificar más tarde.";
    default: return "No fue posible completar la operación de pago. Intenta de nuevo más tarde.";
  }
};

const formatoDinero = (valor: number) => new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
}).format(valor);

const formatoFecha = (valor: string | null | undefined) => valor
  ? new Date(valor).toLocaleString("es-CO")
  : "Sin confirmar";

const etiquetaMetodo = (valor: string | null | undefined) => {
  if (!valor) return "Por confirmar";
  const conocidos: Record<string, string> = { CARD: "Tarjeta", NEQUI: "Nequi", PSE: "PSE", BANCOLOMBIA_TRANSFER: "Transferencia Bancolombia" };
  return conocidos[valor.toUpperCase()] ?? valor.replace(/_/g, " ");
};

const etiquetaIntento = (intento: PagoIntento) => ({
  pendiente: "Pendiente",
  aprobado: "Aprobado",
  rechazado: "Rechazado",
  aprobado_duplicado: "Posible cobro duplicado",
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

  const cobrar = async () => {
    if (!listo || iniciando) return;
    if (!reservarFlujoWompi(idReserva)) {
      onErrorRef.current("Ya hay un pago de Wompi abierto o iniciándose. Finalízalo o espera antes de abrir otro.");
      return;
    }
    setIniciando(true);
    setConsultaError(null);
    try {
      const config = await iniciarPago(idReserva);
      const Checkout = window.WidgetCheckout;
      if (!Checkout) throw new Error("Wompi no está disponible.");
      guardarContextoPago({ idReserva, referencia: config.referencia });
      const checkout = new Checkout(crearConfiguracionWidget(config));
      checkout.open(() => {
        liberarFlujoWompi(idReserva);
        iniciarVerificacion();
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

  if (consultando && !pago) return <span className="pago-estado">Consultando pago…</span>;
  if (consultaError && !pago) return <span className="pago-error">{consultaError} <button type="button" className="pago-refrescar" onClick={refrescarUnaVez}>Reintentar consulta</button></span>;
  if (errorScript && puedePagar) return <span className="pago-error">No se pudo cargar Wompi. <button type="button" className="pago-refrescar" onClick={reintentarScript}>Reintentar</button></span>;

  if (compacto) {
    return <div className="pago-compacto">
      {pago?.estado === "aprobado" && <span className="badge pago-aprobado">Pagado</span>}
      {pago?.estado === "rechazado" && <span className="badge pago-rechazado">Rechazado</span>}
      {pago?.estado === "pendiente" && <span className="badge pago-pendiente">Pendiente</span>}
      {tieneDuplicado && <span className="pago-incidencia-mini" title="Posible doble cobro">Revisar</span>}
      {pago?.estado === "pendiente" && <button type="button" className="pago-refrescar" disabled={verificando} onClick={iniciarVerificacion}>{verificando ? "Verificando…" : "Consultar"}</button>}
      {puedePagar && pago?.estado !== "aprobado" && <button type="button" className="pago-btn pago-btn--compacto" disabled={!listo || iniciando || cargandoScript} onClick={cobrar}>{iniciando ? "Abriendo…" : pago ? "Continuar" : "Cobrar"}</button>}
    </div>;
  }

  return <div className="pago-panel">
    <div className="pago-resumen">
      <div><span className="pago-label">Estado financiero</span><strong className={`pago-valor pago-valor--${pago?.estado ?? "sin-pago"}`}>{pago ? pago.estado : "Sin iniciar"}</strong></div>
      <div><span className="pago-label">Estado operativo</span><strong className="pago-valor">{estadoReserva?.replace(/_/g, " ") ?? "Consultar reserva"}</strong></div>
      {pago && <div><span className="pago-label">Monto</span><strong className="pago-valor">{formatoDinero(pago.monto)}</strong></div>}
      {pago && <div><span className="pago-label">Método real</span><strong className="pago-valor">{etiquetaMetodo(pago.intentoActual?.wompiPaymentMethodType)}</strong></div>}
    </div>

    {pago?.intentoActual && <p className="pago-detalle">Referencia: <code>{pago.intentoActual.referencia}</code><br />Confirmación: {formatoFecha(pago.fechaPago ?? pago.intentoActual.fechaConfirmacion)}</p>}
    {pago?.estado === "aprobado" && estadoReserva === "PENDIENTE" && <p className="pago-aviso">Pago confirmado. La reserva sigue pendiente de asignación.</p>}
    {pago?.estado === "aprobado" && estadoReserva === "CANCELADA" && <p className="pago-incidencia">La reserva continúa cancelada, pero recibió una aprobación tardía. Requiere revisión.</p>}
    {tieneDuplicado && <p className="pago-incidencia">Posible doble cobro detectado. Revisa los intentos; no se ha prometido ni ejecutado un reembolso automático.</p>}
    {esperaAgotada && <p className="pago-aviso">Pago pendiente de confirmación. Puedes consultar de nuevo sin iniciar otro cobro.</p>}
    {verificando && <p className="pago-estado">Consultando confirmación del backend…</p>}

    <div className="pago-acciones">
      {pago?.estado === "pendiente" && <button type="button" className="pago-btn-secundario" disabled={verificando || consultando} onClick={iniciarVerificacion}>{verificando ? "Verificando…" : esperaAgotada ? "Consultar de nuevo" : "Actualizar estado"}</button>}
      {puedePagar && pago?.estado !== "aprobado" && <button type="button" className="pago-btn" disabled={!listo || iniciando || cargandoScript} onClick={cobrar}>{iniciando ? "Abriendo Wompi…" : pago?.estado === "rechazado" ? "Reintentar pago" : pago?.estado === "pendiente" ? "Continuar en Wompi" : "Pagar con Wompi"}</button>}
      {esAdmin && intentoPendiente?.wompiTransactionId && <button type="button" className="pago-btn-secundario" disabled={reconciliando} onClick={reconciliar}>{reconciliando ? "Verificando…" : "Verificar con Wompi"}</button>}
    </div>
    {esAdmin && intentoPendiente && !intentoPendiente.wompiTransactionId && <p className="pago-ayuda">La verificación automática no está disponible hasta que exista un ID de transacción.</p>}

    {pago && pago.intentos.length > 0 && <details className="pago-historial"><summary>Historial de intentos ({pago.intentos.length})</summary><ol>{pago.intentos.map((intento) => <li key={intento.idIntento} className={intento.estado === "aprobado_duplicado" ? "pago-intento--incidencia" : ""}><strong>{etiquetaIntento(intento)}</strong> · {etiquetaMetodo(intento.wompiPaymentMethodType)}<br /><span>{intento.referencia} · {formatoFecha(intento.fechaConfirmacion ?? intento.createdAt)}</span></li>)}</ol></details>}
  </div>;
};
