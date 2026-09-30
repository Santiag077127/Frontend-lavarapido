import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { guardarDestinoTrasLogin } from "@/services/authRedirect";
import { CobrarReservaButton } from "../../components/CobrarReservaButton/CobrarReservaButton";
import { obtenerContextoPago } from "../../services/pagoContext";
import { verificarTransaccion } from "../../services/pagoService";
import "./PagoResultadoPage.css";

export const PagoResultadoPage = () => {
  const token = useAuthStore((state) => state.token);
  const location = useLocation();
  const [mensaje, setMensaje] = useState<string | null>(null);
  const contexto = obtenerContextoPago();
  const idReserva = contexto?.idReserva;
  const referencia = contexto?.referencia;
  const transactionId = new URLSearchParams(location.search).get("id");
  const verificadoRef = useRef<string | null>(null);

  useEffect(() => {
    if (!token) guardarDestinoTrasLogin(`${location.pathname}${location.search}${location.hash}`);
  }, [location.hash, location.pathname, location.search, token]);

  useEffect(() => {
    if (!token || !idReserva || !referencia || !transactionId || verificadoRef.current === transactionId) return;
    verificadoRef.current = transactionId;
    void verificarTransaccion(idReserva, referencia, transactionId)
      .catch(() => setMensaje("No se pudo verificar la transacción con Wompi. Consulta el estado del pago más tarde."));
  }, [idReserva, referencia, token, transactionId]);

  if (!token) return <Navigate to="/login" replace />;

  return <main className="resultado-pago-page">
    <section className="resultado-pago-card">
      <p className="resultado-pago-eyebrow">Wompi</p>
      <h1>Resultado del pago</h1>
      <p className="resultado-pago-intro">La confirmación que ves aquí proviene del backend. El retorno de Wompi solo inició esta consulta.</p>
      {mensaje && <p className="page-error" role="alert">{mensaje}</p>}
      {contexto ? <>
        <p className="resultado-pago-referencia">Referencia esperada: <code>{contexto.referencia}</code></p>
        <CobrarReservaButton idReserva={contexto.idReserva} habilitado={false} autoVerificar onPagoAprobado={() => undefined} onError={setMensaje} />
      </> : <div className="resultado-pago-sin-contexto">
        <h2>No pudimos identificar la reserva</h2>
        <p>El ID recibido en el retorno pertenece a la transacción de Wompi y no se usa como ID de reserva. Vuelve a reservas para consultar el pago correspondiente.</p>
      </div>}
      <Link className="resultado-pago-volver" to="/dashboard/turnos">Volver a reservas</Link>
    </section>
  </main>;
};
