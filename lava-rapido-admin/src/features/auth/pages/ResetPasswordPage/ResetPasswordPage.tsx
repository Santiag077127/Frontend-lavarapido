// Lee el token del enlace y envía la nueva contraseña al backend.
import "./ResetPasswordPage.css";

import { useContext, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";

import { resetPassword } from "../../services/authService";
import { HomeButton } from "../../components/HomeButton/HomeButton";
import { ThemeContext, localizeMessage, useTranslations } from "../../../../theme/theme";

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export const ResetPasswordPage = () => {
  const theme = useContext(ThemeContext);
  const t = useTranslations();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword]               = useState("");
  const [confirmPassword, setConfirmPassword]  = useState("");
  const [isLoading, setIsLoading]              = useState(false);
  const [error, setError]                      = useState("");
  const [success, setSuccess]                  = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("ui.el.enlace.no.es.valido.o.ya.expiro");
      return;
    }

    if (!PASSWORD_REGEX.test(password)) {
      setError("ui.la.contrasena.debe.tener.minimo.8.caracteres.una.mayuscula.una.mi");
      return;
    }

    if (password !== confirmPassword) {
      setError("ui.las.contrasenas.no.coinciden");
      return;
    }

    setIsLoading(true);
    try {
      // El backend comprueba vigencia y uso del token antes de cambiar la contraseña.
      await resetPassword(token, password);
      setSuccess(true);
      // Este sitio es el panel administrativo. Tras actualizar la contraseña,
      // el usuario vuelve a la pantalla principal, no al acceso de administradores.
      setTimeout(() => navigate("/"), 2500);
    } catch (err: any) {
      const status = err.response?.status;
      const backendMsg: string | undefined = err.response?.data?.message;

      if (backendMsg?.includes("expirado")) {
        setError("ui.el.enlace.ha.expirado.solicita.uno.nuevo");
      } else if (backendMsg?.includes("utilizado")) {
        setError("ui.este.enlace.ya.fue.utilizado.solicita.uno.nuevo");
      } else if (status === 400 || status === 404) {
        setError("ui.el.enlace.no.es.valido.solicita.uno.nuevo");
      } else if (status >= 500) {
        setError("ui.error.del.servidor.intentalo.de.nuevo.mas.tarde.2");
      } else {
        setError("ui.error.de.conexion.verifica.tu.internet.2");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ── Pantalla de éxito ──
  if (success) {
    return (
      <div className="rsp-page">
        <HomeButton />
        <div className="rsp-success-box">
          <span className="rsp-success-icon">✓</span>
          <h2 className="rsp-success-title">{t("auth.passwordUpdated")}</h2>
          <p className="rsp-success-msg">{t("ui.tu.contrasena.se.actualizo.correctamente")}<br />{t("ui.seras.redirigido")}</p>
        </div>
      </div>
    );
  }

  // ── Enlace sin token (acceso directo a /reset-password) ──
  if (!token) {
    return (
      <div className="rsp-page">
        <HomeButton />
        <div className="rsp-success-box">
          <h2 className="rsp-success-title">{t("ui.enlace.invalido")}</h2>
          <p className="rsp-success-msg">{t("ui.este.enlace.no.tiene.un.token.valido.o.ya.fue.usado")}</p>
          <Link to="/forgot-password" className="rsp-btn-link">{t("ui.solicitar.un.nuevo.enlace")}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rsp-page">
      <HomeButton />

      <div className="rsp-card">

        <div className="rsp-header">
          <h2 className="rsp-title">{t("auth.newPassword")}</h2>
          <p className="rsp-subtitle">
            {t("auth.newPasswordSubtitle")}
          </p>
        </div>

        {error && (
          <div className="rsp-error" role="alert" aria-live="polite">
            <span className="rsp-error-icon">⚠</span>
            {localizeMessage(error, t)}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="rsp-field">
            <label className="rsp-label" htmlFor="rsp-password">
              {t("auth.newPassword")}
            </label>
            <input
              id="rsp-password"
              type="password"
              placeholder={t("ui.min.8.caracteres")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rsp-input"
              autoComplete="new-password"
              aria-required="true"
              autoFocus
            />
          </div>

          <div className="rsp-field">
            <label className="rsp-label" htmlFor="rsp-confirm">
              {t("auth.confirmPassword")}
            </label>
            <input
              id="rsp-confirm"
              type="password"
              placeholder={t("ui.repite.la.contrasena")}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="rsp-input"
              autoComplete="new-password"
              aria-required="true"
            />
          </div>

          <button
            className="rsp-btn"
            type="submit"
            disabled={isLoading}
            aria-busy={isLoading}
          >
            {isLoading && (
              <svg className="rsp-spinner" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke="currentColor"
                  strokeWidth="3" strokeDasharray="40" strokeDashoffset="10" />
              </svg>
            )}
            {isLoading ? t("auth.updating") : t("auth.updatePassword")}
          </button>
        </form>

      </div>
    </div>
  );
};
