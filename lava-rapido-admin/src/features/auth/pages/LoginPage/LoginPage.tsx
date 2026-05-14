import "./style.css";

import logo from "../../../../assets/images/Logo.png";

import { LoginForm } from "../../components/LoginForm/LoginForm";
/**
 * Página principal del login
 * Contiene branding (panel izquierdo) + formulario (panel derecho)
 */
export const LoginPage = () => {
  return (

    <main className="lp-bg">

      <div className="lp-card">

        {/* Panel izquierdo – branding */}
        <div className="lp-left" aria-hidden="true">

          <img
            src={logo}
            alt="Logo Lava Rápido Vehicular"
            className="lp-logo"
          />

          <p className="lp-tagline">
            Tu vehículo,
            <br />
            <strong>siempre impecable.</strong>
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