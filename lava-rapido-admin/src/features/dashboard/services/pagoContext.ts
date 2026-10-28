// Conserva reserva y referencia en la pestaña para reconocer el retorno de Wompi.
const PAYMENT_CONTEXT_KEY = "wompi-payment-context";

export interface PagoContextoRetorno {
  idReserva: string;
  referencia: string;
}

// Conserva los datos necesarios para reconocer la reserva al volver de Wompi.
export const guardarContextoPago = (contexto: PagoContextoRetorno) => {
  sessionStorage.setItem(PAYMENT_CONTEXT_KEY, JSON.stringify(contexto));
};

export const obtenerContextoPago = (): PagoContextoRetorno | null => {
  try {
    const value = sessionStorage.getItem(PAYMENT_CONTEXT_KEY);
    if (!value) return null;
    const parsed = JSON.parse(value) as Partial<PagoContextoRetorno>;
    return typeof parsed.idReserva === "string" && typeof parsed.referencia === "string"
      ? { idReserva: parsed.idReserva, referencia: parsed.referencia }
      : null;
  } catch {
    return null;
  }
};
