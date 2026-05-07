import logo from "../../../assets/images/Logo.png";
import { LoginForm } from "../components/LoginForm";

/**
 * Página principal del login
 * Contiene branding + formulario
 */
export const LoginPage = () => {

  return (

    // Fondo principal de pantalla completa
    <main className="lp-bg">

      {/* Tarjeta contenedora */}
      <div className="lp-card">

        {/* Panel izquierdo decorativo */}
        <div className="lp-left" aria-hidden="true">

          {/* Elementos decorativos hechos con CSS */}
          <div className="lp-bubble lp-bubble--1" />
          <div className="lp-bubble lp-bubble--2" />
          <div className="lp-bubble lp-bubble--3" />

          {/* Logo principal */}
          <img
            src={logo}
            alt="Logo Lava Rápido Vehicular"
            className="lp-logo"
          />

          {/* Texto descriptivo */}
          <p className="lp-tagline">
            Tu vehículo,
            <br />
            <strong>siempre impecable.</strong>
          </p>

        </div>

        {/* Panel derecho */}
        <div className="lp-right">

          {/* Formulario reutilizable */}
          <LoginForm />

        </div>

      </div>

    </main>
  );
};