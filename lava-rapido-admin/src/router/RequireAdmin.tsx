import { useEffect, useState } from "react";
import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import { api } from "@/services/api";
import { guardarDestinoTrasLogin } from "@/services/authRedirect";
import { useAuthStore } from "@/store/authStore";

type Session = { userId: string; firstName: string; email: string; role: string };
type Status = "checking" | "allowed" | "denied" | "unavailable";

export function RequireAdmin() {
  const token = useAuthStore((state) => state.token);
  const setAuth = useAuthStore((state) => state.setAuth);
  const location = useLocation();
  const [status, setStatus] = useState<Status>("checking");
  const [verifiedToken, setVerifiedToken] = useState<string | null>(null);
  const [checkedToken, setCheckedToken] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!token) return;
    let active = true;
    api.get<Session>("/users/me")
      .then(({ data }) => {
        if (!active) return;
        setCheckedToken(token);
        if (data.role === "ADMIN") {
          setAuth(token, { ...data, role: "ADMIN" });
          setVerifiedToken(token);
          setStatus("allowed");
        } else {
          setVerifiedToken(null);
          setStatus("denied");
        }
      })
      .catch((error: { response?: { status?: number } }) => {
        if (active) {
          setCheckedToken(token);
          setStatus(error.response?.status === 403 ? "denied" : "unavailable");
        }
      });
    return () => { active = false; };
  }, [token, setAuth, attempt]);

  if (!token) {
    guardarDestinoTrasLogin(`${location.pathname}${location.search}${location.hash}`);
    return <Navigate to="/login" replace />;
  }
  if (checkedToken === token && status === "denied") return <Navigate to="/access-denied" replace />;
  if (checkedToken === token && status === "unavailable") return <main role="alert"><p>No se pudo verificar tu sesión.</p><button onClick={() => { setStatus("checking"); setAttempt((value) => value + 1); }}>Reintentar</button><Link to="/">Volver al inicio</Link></main>;
  if (status !== "allowed" || verifiedToken !== token) return <main aria-busy="true">Verificando permisos…</main>;
  return <Outlet />;
}
