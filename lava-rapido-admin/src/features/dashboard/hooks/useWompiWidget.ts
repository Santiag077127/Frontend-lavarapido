import { useCallback, useEffect, useState } from "react";

export const WOMPI_SCRIPT_URL = "https://checkout.wompi.co/widget.js";
const SCRIPT_ID = "wompi-widget-script";
const FLOW_EXPIRATION_MS = 5 * 60_000;

interface WompiWidgetResult {
  transaction?: { id?: string };
}

declare global {
  interface Window {
    WidgetCheckout?: new (config: WompiWidgetConfig) => {
      open: (callback: (result: WompiWidgetResult) => void) => void;
    };
  }
}

export interface WompiWidgetConfig {
  currency: string;
  amountInCents: number;
  reference: string;
  publicKey: string;
  signature: { integrity: string };
  redirectUrl: string;
}

let scriptPromise: Promise<void> | null = null;
let activeFlow: { idReserva: string; expiresAt: number } | null = null;

export const crearConfiguracionWidget = (pago: {
  moneda: string;
  montoEnCentavos: number;
  referencia: string;
  publicKey: string;
  firmaIntegridad: string;
  redirectUrl: string;
}): WompiWidgetConfig => ({
  currency: pago.moneda,
  amountInCents: pago.montoEnCentavos,
  reference: pago.referencia,
  publicKey: pago.publicKey,
  signature: { integrity: pago.firmaIntegridad },
  redirectUrl: pago.redirectUrl,
});

export const reservarFlujoWompi = (idReserva: string) => {
  if (activeFlow && activeFlow.expiresAt > Date.now()) return false;
  activeFlow = { idReserva, expiresAt: Date.now() + FLOW_EXPIRATION_MS };
  return true;
};

export const liberarFlujoWompi = (idReserva: string) => {
  if (activeFlow?.idReserva === idReserva) activeFlow = null;
};

export const cargarWompiWidget = () => {
  if (window.WidgetCheckout) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    let script = (document.getElementById(SCRIPT_ID)
      ?? document.querySelector(`script[src="${WOMPI_SCRIPT_URL}"]`)) as HTMLScriptElement | null;
    let loadTimeout: number | null = null;
    const limpiarListeners = () => {
      script?.removeEventListener("load", alCargar);
      script?.removeEventListener("error", alFallar);
      if (loadTimeout !== null) window.clearTimeout(loadTimeout);
    };
    const alCargar = () => {
      limpiarListeners();
      if (window.WidgetCheckout) {
        script?.setAttribute("data-wompi-status", "loaded");
        resolve();
        return;
      }
      alFallar();
    };
    const alFallar = () => {
      limpiarListeners();
      script?.remove();
      scriptPromise = null;
      reject(new Error("No se pudo cargar el módulo seguro de Wompi."));
    };

    if (script?.dataset.wompiStatus === "loaded") {
      alCargar();
      return;
    }
    if (!script) {
      script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.src = WOMPI_SCRIPT_URL;
      script.async = true;
      script.dataset.wompiStatus = "loading";
      document.head.appendChild(script);
    } else if (!script.id) {
      script.id = SCRIPT_ID;
    }
    script.addEventListener("load", alCargar, { once: true });
    script.addEventListener("error", alFallar, { once: true });
    loadTimeout = window.setTimeout(alFallar, 15_000);
  });
  return scriptPromise;
};

export const useWompiWidget = () => {
  const [intentoCarga, setIntentoCarga] = useState(0);
  const [estado, setEstado] = useState<"cargando" | "listo" | "error">(window.WidgetCheckout ? "listo" : "cargando");

  useEffect(() => {
    let activo = true;
    setEstado(window.WidgetCheckout ? "listo" : "cargando");
    cargarWompiWidget().then(() => activo && setEstado("listo")).catch(() => activo && setEstado("error"));
    return () => { activo = false; };
  }, [intentoCarga]);

  const reintentar = useCallback(() => setIntentoCarga((actual) => actual + 1), []);

  return { listo: estado === "listo", cargando: estado === "cargando", error: estado === "error", reintentar };
};
