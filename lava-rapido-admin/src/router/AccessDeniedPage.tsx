// Muestra el aviso cuando una cuenta no tiene permiso para entrar al panel.
import { Link } from "react-router-dom";
import { useTranslations } from "@/theme/theme";

export function AccessDeniedPage() {
  const t = useTranslations();
  return <main role="alert" style={{ padding: "2rem" }}>
    <h1>{t("ui.acceso.denegado")}</h1>
    <p>{t("ui.tu.cuenta.no.tiene.permisos.de.administracion.vigentes")}</p>
    <Link to="/">{t("ui.volver.al.inicio.2")}</Link>
  </main>;
}
