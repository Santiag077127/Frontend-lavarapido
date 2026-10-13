// Valida y envía el cambio de contraseña de la cuenta.
import { useState } from "react";
import { ArrowLeft, KeyRound } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";

import { changePassword } from "../../services/userService";
import "./ChangePasswordPage.css";

const MAX_PASSWORD_UTF8_BYTES = 72;

export const getPasswordUtf8ByteLength = (password: string): number =>
  new TextEncoder().encode(password).length;

export const isValidNewPassword = (password: string): boolean =>
  password.trim().length > 0
  && password.length >= 8
  && getPasswordUtf8ByteLength(password) <= MAX_PASSWORD_UTF8_BYTES;

export const passwordChangeErrorMessage = (requestError: unknown): string | undefined => {
  if (!axios.isAxiosError(requestError)) {
    return "No fue posible actualizar la contraseña. Verifica tu conexión.";
  }
  const status = requestError.response?.status;
  const code = requestError.response?.data?.error;
  if (status === 401) return undefined;
  if (status === 400 && code === "CURRENT_PASSWORD_INVALID") {
    return "La contraseña actual no es correcta.";
  }
  if (status === 400) return "La nueva contraseña no cumple los requisitos.";
  if (status && status >= 500) return "No fue posible actualizar la contraseña. Inténtalo más tarde.";
  return "No fue posible actualizar la contraseña. Verifica tu conexión.";
};

export const ChangePasswordPage = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoading) return;

    setError("");
    setSuccess("");
    if (!currentPassword || !newPassword || !confirmation) {
      setError("Completa todos los campos.");
      return;
    }
    // La validación local da respuesta inmediata; el backend vuelve a comprobarla.
    if (!isValidNewPassword(newPassword)) {
      setError("La nueva contraseña debe tener al menos 8 caracteres, máximo 72 bytes UTF-8 y no puede contener solo espacios.");
      return;
    }
    if (newPassword !== confirmation) {
      setError("La confirmación no coincide con la nueva contraseña.");
      return;
    }

    setIsLoading(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmation("");
      setSuccess("Contraseña actualizada correctamente.");
    } catch (requestError: unknown) {
      const message = passwordChangeErrorMessage(requestError);
      if (message) setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="change-password-page">
      <Link className="change-password-back" to="/dashboard/configuracion">
        <ArrowLeft size={17} /> Volver a configuración
      </Link>
      <section className="change-password-card" aria-labelledby="change-password-title">
        <KeyRound size={28} aria-hidden="true" />
        <h1 id="change-password-title">Cambiar contraseña</h1>
        <p>Confirma tu contraseña actual y elige una nueva.</p>

        {error && <p className="change-password-error" role="alert">{error}</p>}
        {success && <p className="change-password-success" role="status">{success}</p>}

        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="current-password">Contraseña actual</label>
          <input id="current-password" type="password" value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)} autoComplete="current-password" disabled={isLoading} />

          <label htmlFor="new-password">Nueva contraseña</label>
          <input id="new-password" type="password" value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)} autoComplete="new-password" disabled={isLoading} />
          <small>Al menos 8 caracteres y máximo 72 bytes UTF-8.</small>

          <label htmlFor="confirm-password">Confirmar nueva contraseña</label>
          <input id="confirm-password" type="password" value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)} autoComplete="new-password" disabled={isLoading} />

          <button type="submit" disabled={isLoading} aria-busy={isLoading}>
            {isLoading ? "Actualizando..." : "Actualizar contraseña"}
          </button>
        </form>
      </section>
    </main>
  );
};
