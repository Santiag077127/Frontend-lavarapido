import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-root">
      <div className="landing-left">
        <div className="landing-logo">
          <img src="/src/assets/images/Logo.png" alt="Car Wash Logo" />
        </div>
        <p className="landing-tagline">
          Tu vehículo, <span>siempre impecable.</span>
        </p>
      </div>

      <div className="landing-right">
        <div className="landing-content">
          <h1 className="landing-title">Lava Rápido Vehicular</h1>
          <p className="landing-subtitle">
            Plataforma de gestión administrativa para servicios de lavado
            vehicular. Agenda, seguimiento en tiempo real y administración
            desde un solo lugar.
          </p>

          <div className="landing-features">
            <div className="feature-item">
              <span className="feature-icon"></span>
              <div>
                <p className="feature-title">App Móvil</p>
                <p className="feature-desc">
                  Desarrollada con React Native y Expo para clientes.
                </p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon"></span>
              <div>
                <p className="feature-title">Seguimiento GPS</p>
                <p className="feature-desc">
                  Visualiza el estado del servicio en tiempo real.
                </p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon"></span>
              <div>
                <p className="feature-title">Tema Oscuro</p>
                <p className="feature-desc">
                  Interfaz adaptable con modo claro y oscuro.
                </p>
              </div>
            </div>
          </div>

          <div className="landing-actions">
            <button
              className="btn-primary"
              onClick={() => navigate("/login")}
            >
              Iniciar Sesión
              <span className="btn-badge">Solo administradores</span>
            </button>

            <button
              className="btn-secondary"
              onClick={() =>
                alert(
                  "El registro de usuarios está disponible exclusivamente en la app móvil de Lava Rápido."
                )
              }
            >
              Registrarse
            </button>
          </div>

          <p className="landing-note">
            ¿Eres cliente? Descarga la app móvil para registrarte y agendar
            tu servicio.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
