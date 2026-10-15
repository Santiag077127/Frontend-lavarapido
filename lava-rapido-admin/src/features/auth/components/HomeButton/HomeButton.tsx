// Ofrece un enlace reutilizable para volver al inicio.
import { Link } from "react-router-dom";
import { useTranslations } from "@/theme/theme";
import "./HomeButton.css";

export const HomeButton = () => {
  const t = useTranslations();
  return (
  <Link to="/" className="auth-home-button">{t("ui.volver.al.inicio")}</Link>
  );
};
