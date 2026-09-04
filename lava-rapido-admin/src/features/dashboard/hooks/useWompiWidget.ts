import { useEffect, useState } from "react";

declare global {
  interface Window {
    WidgetCheckout?: new (config: WompiWidgetConfig) => { open: (callback: () => void) => void };
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

const cargarScript = () => {
  if (window.WidgetCheckout) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const existente = document.querySelector<HTMLScriptElement>('script[src="https://checkout.wompi.co/widget.js"]');
    const script = existente ?? document.createElement("script");
    const listo = () => window.WidgetCheckout ? resolve() : reject(new Error("Wompi no expuso el WidgetCheckout."));

    if (existente) {
      existente.addEventListener("load", listo, { once: true });
      existente.addEventListener("error", () => reject(new Error("No se pudo cargar Wompi.")), { once: true });
    } else {
      script.src = "https://checkout.wompi.co/widget.js";
      script.async = true;
      script.addEventListener("load", listo, { once: true });
      script.addEventListener("error", () => reject(new Error("No se pudo cargar Wompi.")), { once: true });
      document.head.appendChild(script);
    }
  });
  return scriptPromise;
};

export const useWompiWidget = () => {
  const [estado, setEstado] = useState<"cargando" | "listo" | "error">(window.WidgetCheckout ? "listo" : "cargando");

  useEffect(() => {
    cargarScript().then(() => setEstado("listo")).catch(() => setEstado("error"));
  }, []);

  return { listo: estado === "listo", error: estado === "error" };
};
