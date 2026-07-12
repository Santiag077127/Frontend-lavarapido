import "./ResetPasswordPage.css";

import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";

import { resetPassword } from "../../services/authService";

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export const ResetPasswordPage = () => {
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
      setError("El enlace no es válido o ya expiró.");
      return;
    }

    if (!PASSWORD_REGEX.test(password)) {
      setError("La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula y un número.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2500);
    } catch (err: any) {
      const status = err.response?.status;
      const backendMsg: string | undefined = err.response?.data?.message;

      if (backendMsg?.includes("expirado")) {
        setError("El enlace ha expirado. Solicita uno nuevo.");
      } else if (backendMsg?.includes("utilizado")) {
        setError("Este enlace ya fue utilizado. Solicita uno nuevo.");
      } else if (status === 400 || status === 404) {
        setError("El enlace no es válido. Solicita uno nuevo.");
      } else if (status >= 500) {
        setError("Error del servidor. Inténtalo de nuevo más tarde.");
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
      <div className="rsp-page">
        <div className="rsp-success-box">
          <span className="rsp-success-icon">✓</span>
          <h2 className="rsp-success-title">Contraseña actualizada</h2>
          <p className="rsp-success-msg">
            Ya puedes iniciar sesión con tu nueva contraseña.<br />
            Serás redirigido…
          </p>
        </div>
      </div>
    );
  }

  // ── Enlace sin token (acceso directo a /reset-password) ──
  if (!token) {
    return (
      <div className="rsp-page">
        <div className="rsp-success-box">
          <h2 className="rsp-success-title">Enlace inválido</h2>
          <p className="rsp-success-msg">
            Este enlace no tiene un token válido o ya fue usado.
          </p>
          <Link to="/forgot-password" className="rsp-btn-link">
            Solicitar un nuevo enlace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rsp-page">

      <button
        type="button"
        className="rsp-back-btn"
        onClick={() => navigate("/login")}
      >
        ← Volver a iniciar sesión
      </button>

      <div className="rsp-card">

        <div className="rsp-header">
          <h2 className="rsp-title">Nueva contraseña</h2>
          <p className="rsp-subtitle">
            Ingresa y confirma tu nueva contraseña.
          </p>
        </div>

        {error && (
          <div className="rsp-error" role="alert" aria-live="polite">
            <span className="rsp-error-icon">⚠</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="rsp-field">
            <label className="rsp-label" htmlFor="rsp-password">
              Nueva contraseña
            </label>
            <input
              id="rsp-password"
              type="password"
              placeholder="Mín. 8 caracteres"
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
              Confirmar contraseña
            </label>
            <input
              id="rsp-confirm"
              type="password"
              placeholder="Repite la contraseña"
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
            {isLoading ? "Actualizando..." : "Actualizar contraseña"}
          </button>
        </form>

      </div>
    </div>
  );
};