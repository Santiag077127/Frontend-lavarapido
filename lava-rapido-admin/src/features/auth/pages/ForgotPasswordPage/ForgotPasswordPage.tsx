import "./ForgotPasswordPage.css";

import { useContext, useState } from "react";
import axios from "axios";
import { ArrowLeft } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import { HomeButton } from "../../components/HomeButton/HomeButton";
import { forgotPassword } from "../../services/authService";
import type { ForgotPasswordErrorResponse } from "../../types";
import { useAuthStore } from "../../../../store/authStore";
import { ThemeContext } from "../../../../theme/theme";

export const ForgotPasswordPage = () => {
  const theme = useContext(ThemeContext);
  const t = theme?.t ?? ((key: string) => key);
  const location = useLocation();
  const token = useAuthStore((state) => state.token);
  const [email, setEmail]         = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState(false);
  const vieneDelDashboard = Boolean(
    (location.state as { fromDashboard?: boolean } | null)?.fromDashboard || token
  );

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateEmail(email)) {
      setError("Ingresa un correo electrónico válido.");
      return;
    }

    setIsLoading(true);
    try {
      await forgotPassword(email);
      // El backend siempre responde 200, exista o no el correo
      // (por seguridad, no revela qué correos están registrados).
      setSuccess(true);
    } catch (error: unknown) {
      if (axios.isAxiosError<ForgotPasswordErrorResponse>(error) && error.response) {
        setError(error.response.data.error);
      } else {
        setError("Error de conexión. Verifica tu internet.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ── Pantalla de éxito ──
  if (success) {
    return (
      <div className="fpp-page">
        {vieneDelDashboard ? <DashboardBackLink label={t("common.backToSettings")} /> : <HomeButton />}
        <div className="fpp-success-box">
          <span className="fpp-success-icon">✓</span>
          <h2 className="fpp-success-title">{t("auth.checkEmail")}</h2>
          <p className="fpp-success-msg">
            Si <strong>{email}</strong> está registrado, te enviamos un enlace
            para restablecer tu contraseña.<br />
            El enlace vence en 30 minutos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fpp-page">
      {vieneDelDashboard ? <DashboardBackLink label={t("common.backToSettings")} /> : <HomeButton />}

      <div className="fpp-card">

        <div className="fpp-header">
          <h2 className="fpp-title">{t("auth.resetPasswordTitle")}</h2>
          <p className="fpp-subtitle">
            {t("auth.resetPasswordSubtitle")}
          </p>
        </div>

        {error && (
          <div className="fpp-error" role="alert" aria-live="polite">
            <span className="fpp-error-icon">⚠</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="fpp-field">
            <label className="fpp-label" htmlFor="fpp-email">
              {t("auth.email")}
            </label>
            <input
              id="fpp-email"
              type="email"
              placeholder="ejemplo@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="fpp-input"
              autoComplete="email"
              aria-required="true"
              autoFocus
            />
          </div>

          <button
            className="fpp-btn"
            type="submit"
            disabled={isLoading}
            aria-busy={isLoading}
          >
            {isLoading && (
              <svg className="fpp-spinner" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke="currentColor"
                  strokeWidth="3" strokeDasharray="40" strokeDashoffset="10" />
              </svg>
            )}
            {isLoading ? t("auth.sending") : t("auth.sendReset")}
          </button>
        </form>

      </div>
    </div>
  );
};

const DashboardBackLink = ({ label }: { label: string }) => (
  <Link to="/dashboard/configuracion" className="fpp-dashboard-back">
    <ArrowLeft size={17} />
    {label}
  </Link>
);
