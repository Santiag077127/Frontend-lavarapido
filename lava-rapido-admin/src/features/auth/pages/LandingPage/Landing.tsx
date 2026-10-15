// Presenta la web pública y sus accesos a autenticación.
import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CalendarCheck,
  Car,
  CheckCircle2,
  CreditCard,
  LockKeyhole,
  MapPin,
  Moon,
  Sparkles,
  Sun,
  UsersRound,
} from "lucide-react";
import { ThemeContext, useTranslations } from "../../../../theme/theme";
import type { LanguageOption } from "../../../../theme/theme";
import logo from "../../../../assets/images/Logo.png";
import "./LandingPage.css";

const languageOptions: Array<{ value: LanguageOption; labelKey: string }> = [
  { value: "es", labelKey: "language.es" },
  { value: "en", labelKey: "language.en" },
  { value: "fr", labelKey: "language.fr" },
  { value: "pt", labelKey: "language.pt" },
];

const featureCards = [
  {
    icon: CalendarCheck,
    titleKey: "landing.feature.turns.title",
    descriptionKey: "landing.feature.turns.desc",
  },
  {
    icon: UsersRound,
    titleKey: "landing.feature.operators.title",
    descriptionKey: "landing.feature.operators.desc",
  },
  {
    icon: CreditCard,
    titleKey: "landing.feature.payments.title",
    descriptionKey: "landing.feature.payments.desc",
  },
  {
    icon: Car,
    titleKey: "landing.feature.vehicles.title",
    descriptionKey: "landing.feature.vehicles.desc",
  },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const theme = useContext(ThemeContext);
  const t = useTranslations();

  return (
    <main className="landing-root">
      <nav className="landing-nav" aria-label={t("ui.navegacion.principal")}>
        <Link to="/" className="landing-brand" aria-label="Lava Rápido Vehicular">
          <img src={logo} alt="" />
          <span>{t("landing.brand")}</span>
        </Link>

        <div className="landing-nav-links">
          <a href="#funciones">{t("landing.features")}</a>
          <a href="#operacion">{t("landing.operation")}</a>
          <a href="#seguridad">{t("landing.security")}</a>
        </div>

        <div className="landing-nav-actions">
          {theme && (
            <label className="nav-pill nav-language">
              <span>{theme.language.toUpperCase()}</span>
              <select
                aria-label={t("settings.language.title")}
                value={theme.language}
                onChange={(event) => theme.setLanguage(event.target.value as LanguageOption)}
              >
                {languageOptions.map((option) => (
                  <option value={option.value} key={option.value}>
                    {t(option.labelKey)}
                  </option>
                ))}
              </select>
            </label>
          )}
          <button
            className="nav-pill nav-mode"
            type="button"
            aria-label={t("ui.cambiar.modo.de.color")}
            onClick={() => theme?.setDarkMode(!theme.darkMode)}
          >
            {theme?.darkMode ? <Moon size={16} /> : <Sun size={16} />}
            <span>{theme?.darkMode ? t("mode.darkShort") : t("mode.lightShort")}</span>
          </button>
          <button className="admin-access" type="button" onClick={() => navigate("/login")}>
            <LockKeyhole size={16} />
            {t("landing.adminAccess")}
          </button>
        </div>
      </nav>

      <section className="landing-hero">
        <div className="hero-copy">
          <p className="hero-eyebrow">
            <Sparkles size={16} />
            {t("landing.eyebrow")}
          </p>
          <h1>{t("landing.title")}</h1>
          <p className="hero-description">
            {t("landing.description")}
          </p>

          <div className="hero-actions">
            <button className="hero-primary" type="button" onClick={() => navigate("/register")}>
              {t("landing.register")}
            </button>
            <button className="hero-secondary" type="button" onClick={() => navigate("/forgot-password")}>
              {t("landing.resetPassword")}
            </button>
          </div>

          <p className="hero-note">
            {t("landing.note")}
          </p>
        </div>

        <div className="hero-visual" aria-label={t("ui.vista.previa.del.panel.administrativo")}>
          <div className="dashboard-mockup">
            <div className="mockup-header">
              <div>
                <span>{t("ui.panel.de.hoy")}</span>
                <strong>{t("ui.reservas.activas")}</strong>
              </div>
              <CheckCircle2 size={22} />
            </div>

            <div className="mockup-stats">
              <article>
                <span>{t("turns.title")}</span>
                <strong>18</strong>
              </article>
              <article>
                <span>{t("turns.inProgress")}</span>
                <strong>06</strong>
              </article>
              <article>
                <span>{t("ui.pagos")}</span>
                <strong>12</strong>
              </article>
            </div>

            <div className="mockup-list">
              <div className="mockup-row">
                <span className="status-dot active" />
                <div>
                  <strong>{t("ui.camioneta.suv")}</strong>
                  <span>{t("ui.lavado.premium")}</span>
                </div>
                <small>09:30</small>
              </div>
              <div className="mockup-row">
                <span className="status-dot pending" />
                <div>
                  <strong>{t("ui.automovil")}</strong>
                  <span>{t("ui.pago.pendiente")}</span>
                </div>
                <small>10:15</small>
              </div>
              <div className="mockup-row">
                <span className="status-dot done" />
                <div>
                  <strong>{t("ui.moto")}</strong>
                  <span>{t("ui.servicio.finalizado")}</span>
                </div>
                <small>11:00</small>
              </div>
            </div>

            <div className="mockup-floating-card">
              <MapPin size={18} />
              <div>
                <strong>{t("ui.sede.activa")}</strong>
                <span>Neiva, Huila</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="funciones" className="landing-section">
        <div className="section-intro">
          <p>Lava Rápido Vehicular</p>
          <h2>{t("landing.section.title")}</h2>
        </div>

        <div className="feature-grid">
          {featureCards.map((feature) => {
            const Icon = feature.icon;

            return (
              <article className="feature-card" key={feature.titleKey}>
                <Icon size={24} />
                <h3>{t(feature.titleKey)}</h3>
                <p>{t(feature.descriptionKey)}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section id="operacion" className="landing-band">
        <div>
          <span>{t("landing.band")}</span>
        </div>
      </section>

      <span id="seguridad" className="landing-anchor" aria-hidden="true" />
    </main>
  );
};

export default LandingPage;
