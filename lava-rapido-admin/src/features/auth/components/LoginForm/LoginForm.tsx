import "./style.css";

import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

import { login } from "../../services/authService";
import { useAuthStore } from "../../../../store/authStore"; 
import type { AuthState } from "../../../../store/authStore";
import { ThemeContext } from "../../../../theme/theme";
import { consumirDestinoTrasLogin } from "../../../../services/authRedirect";

export const LoginForm = () => {
  const theme = useContext(ThemeContext);
  const t = theme?.t ?? ((key: string) => key);
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState("");

  const navigate = useNavigate();
  const setAuth  = useAuthStore((state: AuthState) => state.setAuth);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateEmail(email)) {
      setError("Por favor ingresa un correo electrónico válido");
      return;
    }
    if (!password.trim()) {
      setError("Por favor ingresa tu contraseña");
      return;
    }

    setIsLoading(true);

    try {
      const data = await login(email, password);
      setAuth(data.token, data.user);

      const destinoPendiente = consumirDestinoTrasLogin();
      if (destinoPendiente) {
        navigate(destinoPendiente, { replace: true });
        return;
      }

      if (data.user.role === "ADMIN") {
        navigate("/dashboard");
      } else {
        navigate("/");
      }

    } catch (error: any) {
      if (error.response?.status === 401) {
        setError("Credenciales incorrectas");
      } else if (error.response?.status >= 500) {
        setError("Error del servidor. Inténtalo de nuevo más tarde");
      } else {
        setError("Error de conexión. Verifica tu internet");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="lf-wrapper">
      <h2 className="lf-title">{t("auth.loginTitle")}</h2>
      <p className="lf-subtitle">{t("auth.loginSubtitle")}</p>

      {error && (
        <div className="lf-error" role="alert" aria-live="polite">
          <span className="lf-error-icon">⚠</span>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>

        <div className="lf-field">
          <label className="lf-label" htmlFor="lf-email">{t("auth.email")}</label>
          <input
            id="lf-email"
            type="email"
            placeholder="ejemplo@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="lf-input"
            autoComplete="email"
            aria-required="true"
          />
        </div>

        <div className="lf-field">
          <div className="lf-password-row">
            <label className="lf-label" htmlFor="lf-password">{t("auth.password")}</label>

          </div>
          <input
            id="lf-password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="lf-input"
            autoComplete="current-password"
            aria-required="true"
          />
        </div>

        <button
          className="lf-btn"
          type="submit"
          disabled={isLoading}
          aria-busy={isLoading}
        >
          {isLoading && (
            <svg className="lf-spinner" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeDashoffset="10" />
            </svg>
          )}
          {isLoading ? t("auth.signingIn") : t("auth.signIn")}
        </button>

      </form>
    </div>
  );
};
