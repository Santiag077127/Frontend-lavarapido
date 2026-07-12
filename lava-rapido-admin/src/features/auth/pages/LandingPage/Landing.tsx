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

            {/* ── Web admin ── */}
            <div className="feature-item">
              <span className="feature-icon"></span>
              <div>
                <p className="feature-title">Web administrativa</p>
                <p className="feature-desc">
                  Desarrollada con React, exclusiva para administradores.
                </p>
              </div>
            </div>

            {/* ── App móvil ── */}
            <div className="feature-item">
              <span className="feature-icon"></span>
              <div>
                <p className="feature-title">App Móvil</p>
                <p className="feature-desc">
                  Desarrollada con React Native para usuarios y operadores.
                </p>
              </div>
            </div>

            {/* ── Idiomas ── */}
            <div className="feature-item">
              <span className="feature-icon"></span>
              <div>
                <p className="feature-title">Multiidioma</p>
                <p className="feature-desc">
                  Disponible en español, inglés, francés y portugués.
                </p>
              </div>
            </div>

            {/* ── Tema ── */}
            <div className="feature-item">
              <span className="feature-icon"></span>
              <div>
                <p className="feature-title">Tema personalizable</p>
                <p className="feature-desc">
                  Interfaz adaptable con modo claro, oscuro y colores a tu gusto.
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
              onClick={() => navigate("/register")}
            >
              <span className="">Registrate como usuario</span>
            </button>
          </div>

          <p className="landing-note">
            ¿Eres usuario u operador? Descarga la app móvil para acceder al servicio.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;