// Presenta el formulario de inicio de sesión.
import "./style.css";

import logo from "../../../../assets/images/Logo.png";
import { formatTranslation, useTranslations } from "@/theme/theme";
import { useLocation } from "react-router-dom";

import { HomeButton } from "../../components/HomeButton/HomeButton";
import { LoginForm } from "../../components/LoginForm/LoginForm";
/**
 * Página principal del login
 * Contiene branding (panel izquierdo) + formulario (panel derecho)
 */
export const LoginPage = () => {
  const t = useTranslations();
  const location = useLocation();
  const loginState = location.state as { notice?: string; email?: string } | null;
  const notice = loginState?.notice;
  return (

    <main className="lp-bg">
      <HomeButton />

      <div className="lp-card">

        {/* Panel izquierdo – branding */}
        <div className="lp-left" aria-hidden="true">

          <img
            src={logo}
            alt="Logo Lava Rápido Vehicular"
            className="lp-logo"
          />

          <p className="lp-tagline">{t("ui.tu.vehiculo")}<br />
            <strong>{t("ui.siempre.impecable")}</strong>
          </p>

        </div>

        {/* Panel derecho – formulario */}
        <div className="lp-right">
          {notice && <p role="status" className="lp-notice">{notice === "emailChange.success"
            ? formatTranslation(t(notice), { email: loginState?.email ?? "" })
            : notice}</p>}
          <LoginForm />
        </div>

      </div>

    </main>
  );
};
