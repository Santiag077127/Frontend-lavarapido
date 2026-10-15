// Presenta el formulario de inicio de sesión.
import "./style.css";

import logo from "../../../../assets/images/Logo.png";
import { useTranslations } from "@/theme/theme";

import { HomeButton } from "../../components/HomeButton/HomeButton";
import { LoginForm } from "../../components/LoginForm/LoginForm";
/**
 * Página principal del login
 * Contiene branding (panel izquierdo) + formulario (panel derecho)
 */
export const LoginPage = () => {
  const t = useTranslations();
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
          <LoginForm />
        </div>

      </div>

    </main>
  );
};
