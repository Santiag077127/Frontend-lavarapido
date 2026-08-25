import "./ForgotPasswordPage.css";

import { useState } from "react";
import axios from "axios";

import { HomeButton } from "../../components/HomeButton/HomeButton";
import { forgotPassword } from "../../services/authService";
import type { ForgotPasswordErrorResponse } from "../../types";

export const ForgotPasswordPage = () => {
  const [email, setEmail]         = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState(false);

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
        <HomeButton />
        <div className="fpp-success-box">
          <span className="fpp-success-icon">✓</span>
          <h2 className="fpp-success-title">Revisa tu correo</h2>
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
      <HomeButton />

      <div className="fpp-card">

        <div className="fpp-header">
          <h2 className="fpp-title">Recuperar contraseña</h2>
          <p className="fpp-subtitle">
            Ingresa tu correo y te enviaremos un enlace para crear una nueva contraseña.
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
              Correo electrónico
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
            {isLoading ? "Enviando..." : "Enviar enlace de recuperación"}
          </button>
        </form>

      </div>
    </div>
  );
};
