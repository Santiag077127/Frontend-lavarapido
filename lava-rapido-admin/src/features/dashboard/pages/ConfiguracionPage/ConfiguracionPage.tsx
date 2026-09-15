import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Languages,
  LockKeyhole,
  LogOut,
  Moon,
  Palette,
  Settings,
  Sun,
  UserRound,
} from "lucide-react";
import { ThemeContext, type AccentColor, type LanguageOption } from "@/theme/theme";
import { useAuthStore } from "@/store/authStore";
import { LogoutModal } from "../../components/LogoutModal";
import "./ConfiguracionPage.css";

const accentOptions: Array<{ value: AccentColor; labelKey: string }> = [
  { value: "blue", labelKey: "color.blue" },
  { value: "cyan", labelKey: "color.cyan" },
  { value: "indigo", labelKey: "color.indigo" },
  { value: "emerald", labelKey: "color.emerald" },
];

const languageOptions: Array<{ value: LanguageOption; labelKey: string }> = [
  { value: "es", labelKey: "language.es" },
  { value: "en", labelKey: "language.en" },
  { value: "fr", labelKey: "language.fr" },
  { value: "pt", labelKey: "language.pt" },
];

export const ConfiguracionPage = () => {
  const theme = useContext(ThemeContext);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const [modalVisible, setModalVisible] = useState(false);

  if (!theme) return null;
  const { t } = theme;

  const handleLogout = () => {
    setModalVisible(false);
    logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="configuracion-page">
      <header className="config-header">
        <div>
          <p className="config-eyebrow">
            <Settings size={16} />
            {t("settings.eyebrow")}
          </p>
          <h2>{t("settings.title")}</h2>
          <p>{t("settings.subtitle")}</p>
        </div>
      </header>

      <section className="config-grid">
        <article className="config-card config-card--profile">
          <UserRound size={24} />
          <div>
            <h3>{t("settings.profile.title")}</h3>
            <p>{t("settings.profile.desc")}</p>
          </div>
          <Link to="/dashboard/perfil">{t("settings.profile.action")}</Link>
        </article>

        <article className="config-card">
          <LockKeyhole size={24} />
          <div>
            <h3>{t("settings.password.title")}</h3>
            <p>{t("settings.password.desc")}</p>
          </div>
          <Link to="/forgot-password" state={{ fromDashboard: true }}>
            <ArrowLeft size={16} />
            {t("settings.password.action")}
          </Link>
        </article>

        <article className="config-card">
          <Moon size={24} />
          <div>
            <h3>{t("settings.mode.title")}</h3>
            <p>{t("settings.mode.desc")}</p>
          </div>
          <button
            className="config-toggle"
            type="button"
            onClick={() => theme.setDarkMode(!theme.darkMode)}
            aria-pressed={theme.darkMode}
          >
            {theme.darkMode ? <Moon size={18} /> : <Sun size={18} />}
            {theme.darkMode ? t("settings.mode.dark") : t("settings.mode.light")}
          </button>
        </article>

        <article className="config-card">
          <Palette size={24} />
          <div>
            <h3>{t("settings.color.title")}</h3>
            <p>{t("settings.color.desc")}</p>
          </div>
          <div className="accent-options" aria-label="Color de interfaz">
            {accentOptions.map((option) => (
              <button
                className={`accent-option accent-option--${option.value}`}
                type="button"
                key={option.value}
                onClick={() => theme.setAccentColor(option.value)}
                aria-pressed={theme.accentColor === option.value}
              >
                <span />
                {t(option.labelKey)}
              </button>
            ))}
          </div>
        </article>

        <article className="config-card">
          <Languages size={24} />
          <div>
            <h3>{t("settings.language.title")}</h3>
            <p>{t("settings.language.desc")}</p>
          </div>
          <select
            className="config-select"
            value={theme.language}
            onChange={(event) => theme.setLanguage(event.target.value as LanguageOption)}
          >
            {languageOptions.map((option) => (
              <option value={option.value} key={option.value}>
                {t(option.labelKey)}
              </option>
            ))}
          </select>
        </article>

        <article className="config-card config-card--danger">
          <LogOut size={24} />
          <div>
            <h3>{t("settings.logout.title")}</h3>
            <p>{t("settings.logout.desc")}</p>
          </div>
          <button type="button" onClick={() => setModalVisible(true)}>
            {t("settings.logout.action")}
          </button>
        </article>
      </section>

      {modalVisible && (
        <LogoutModal
          onConfirmar={handleLogout}
          onCancelar={() => setModalVisible(false)}
        />
      )}
    </div>
  );
};
