// Explains why an authenticated account cannot access the dashboard.
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useTranslations } from "@/theme/theme";

export function AccessDeniedPage() {
  const t = useTranslations();
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  if (!token) return <Navigate to="/login" replace />;

  return <main role="alert" style={{ padding: "2rem" }}>
    <h1>{t("ui.acceso.denegado")}</h1>
    <p>{t("ui.tu.cuenta.no.tiene.permisos.de.administracion.vigentes")}</p>
    <button type="button" onClick={handleLogout}>{t("settings.logout.action")}</button>
    <Link to="/">{t("ui.volver.al.inicio.2")}</Link>
  </main>;
}
