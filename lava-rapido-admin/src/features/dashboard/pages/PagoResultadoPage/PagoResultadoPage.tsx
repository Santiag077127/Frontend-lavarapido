// Verifica con el backend el retorno de Wompi y muestra el estado del pago.
import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { useTranslations, localizeMessage } from "@/theme/theme";
import { useAuthStore } from "@/store/authStore";
import { guardarDestinoTrasLogin } from "@/services/authRedirect";
import { CobrarReservaButton } from "../../components/CobrarReservaButton/CobrarReservaButton";
import { obtenerContextoPago } from "../../services/pagoContext";
import { verificarTransaccion } from "../../services/pagoService";
import "./PagoResultadoPage.css";

export const PagoResultadoPage = () => {
  const t = useTranslations();
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
    // El ID del retorno se verifica junto con la reserva y referencia guardadas.
    if (!token || !idReserva || !referencia || !transactionId || verificadoRef.current === transactionId) return;
    verificadoRef.current = transactionId;
    void verificarTransaccion(idReserva, referencia, transactionId)
      .catch(() => setMensaje("ui.no.se.pudo.verificar.la.transaccion.con.wompi.consulta.el.estado"));
  }, [idReserva, referencia, token, transactionId]);

  if (!token) return <Navigate to="/login" replace />;

  return <main className="resultado-pago-page">
    <section className="resultado-pago-card">
      <p className="resultado-pago-eyebrow">Wompi</p>
      <h1>{t("ui.resultado.del.pago")}</h1>
      <p className="resultado-pago-intro">{t("ui.la.confirmacion.que.ves.aqui.proviene.del.backend.el.retorno.de")}</p>
      {mensaje && <p className="page-error" role="alert">{localizeMessage(mensaje, t)}</p>}
      {contexto ? <>
        <p className="resultado-pago-referencia">{t("ui.referencia.esperada") + " "}<code>{contexto.referencia}</code></p>
        <CobrarReservaButton idReserva={contexto.idReserva} habilitado={false} autoVerificar onPagoAprobado={() => undefined} onError={setMensaje} />
      </> : <div className="resultado-pago-sin-contexto">
        <h2>{t("ui.no.pudimos.identificar.la.reserva")}</h2>
        <p>{t("ui.el.id.recibido.en.el.retorno.pertenece.a.la.transaccion.de.wompi")}</p>
      </div>}
      <Link className="resultado-pago-volver" to="/dashboard/turnos">{t("ui.volver.a.reservas")}</Link>
    </section>
  </main>;
};
