import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { consultarPago, iniciarPago, type EstadoPago, type Pago } from "../../services/pagoService";
import { useWompiWidget } from "../../hooks/useWompiWidget";
import "./CobrarReservaButton.css";

interface Props {
  idReserva: string;
  habilitado: boolean;
  compacto?: boolean;
  onPagoAprobado: () => Promise<void> | void;
  onError: (mensaje: string) => void;
}

const mensajeError = (error: unknown, fallback: string) =>
  axios.isAxiosError(error) ? error.response?.data?.error || fallback : fallback;

export const CobrarReservaButton = ({ idReserva, habilitado, compacto = false, onPagoAprobado, onError }: Props) => {
  const { listo, error: errorScript } = useWompiWidget();
  const [pago, setPago] = useState<Pago | null>(null);
  const [consultando, setConsultando] = useState(true);
  const [iniciando, setIniciando] = useState(false);
  const [verificando, setVerificando] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const consultar = async () => {
    try {
      const resultado = await consultarPago(idReserva);
      setPago(resultado);
      return resultado;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        setPago(null);
        return null;
      }
      throw error;
    }
  };

  useEffect(() => {
    setConsultando(true);
    consultar().catch((error) => onError(mensajeError(error, "No se pudo consultar el pago."))).finally(() => setConsultando(false));
    return () => { if (timeoutRef.current) window.clearTimeout(timeoutRef.current); };
  }, [idReserva]);

  const verificarHastaResolver = async (inicio: number) => {
    try {
      const resultado = await consultar();
      if (resultado?.estado === "aprobado") {
        setVerificando(false);
        await onPagoAprobado();
        return;
      }
      if (resultado?.estado === "rechazado") {
        setVerificando(false);
        return;
      }
      if (Date.now() - inicio >= 120_000) {
        setVerificando(false);
        onError("El pago sigue verificándose. Wompi puede tardar; usa Actualizar para consultar de nuevo.");
        return;
      }
      timeoutRef.current = window.setTimeout(() => verificarHastaResolver(inicio), 3_000);
    } catch (error) {
      setVerificando(false);
      onError(mensajeError(error, "No se pudo verificar el pago."));
    }
  };

  const cobrar = async () => {
    if (!listo) return;
    setIniciando(true);
    try {
      const config = await iniciarPago(idReserva);
      const Checkout = window.WidgetCheckout;
      if (!Checkout) throw new Error("El módulo de Wompi no está disponible.");
      const checkout = new Checkout({ currency: config.moneda, amountInCents: config.montoEnCentavos, reference: config.referencia, publicKey: config.publicKey, signature: { integrity: config.firmaIntegridad }, redirectUrl: config.redirectUrl });
      checkout.open(() => {
        setVerificando(true);
        verificarHastaResolver(Date.now());
      });
    } catch (error) {
      onError(mensajeError(error, "No se pudo iniciar el cobro."));
    } finally { setIniciando(false); }
  };

  if (consultando) return <span className="pago-estado">Consultando pago…</span>;
  if (errorScript) return <span className="pago-error">No se pudo cargar Wompi. Recarga la página.</span>;
  if (pago?.estado === "aprobado") return <span className="badge pago-aprobado">Pagado</span>;
  if (pago?.estado === "rechazado") return <span className="badge pago-rechazado">Pago rechazado</span>;
  if (verificando) return <span className="pago-estado">Verificando pago… <button type="button" className="pago-refrescar" onClick={() => verificarHastaResolver(Date.now())}>Actualizar</button></span>;
  if (pago?.estado === "pendiente") return <span className="pago-estado">Pago pendiente. <button type="button" className="pago-refrescar" onClick={() => { setVerificando(true); verificarHastaResolver(Date.now()); }}>Actualizar</button></span>;
  if (!habilitado) return null;
  return <button type="button" className={compacto ? "pago-btn pago-btn--compacto" : "pago-btn"} disabled={!listo || iniciando} onClick={cobrar}>{iniciando ? "Abriendo…" : listo ? "Cobrar" : "Cargando Wompi…"}</button>;
};
