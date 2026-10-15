// Valida y envía el cambio de contraseña de la cuenta.
import { useState } from "react";
import { ArrowLeft, KeyRound } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useTranslations, localizeMessage } from "@/theme/theme";

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
    return "ui.no.fue.posible.actualizar.la.contrasena.verifica.tu.conexion";
  }
  const status = requestError.response?.status;
  const code = requestError.response?.data?.error;
  if (status === 401) return undefined;
  if (status === 400 && code === "CURRENT_PASSWORD_INVALID") {
    return "ui.la.contrasena.actual.no.es.correcta";
  }
  if (status === 400) return "ui.la.nueva.contrasena.no.cumple.los.requisitos";
  if (status && status >= 500) return "ui.no.fue.posible.actualizar.la.contrasena.intentalo.mas.tarde";
  return "ui.no.fue.posible.actualizar.la.contrasena.verifica.tu.conexion";
};

export const ChangePasswordPage = () => {
  const t = useTranslations();
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
      setError("ui.completa.todos.los.campos");
      return;
    }
    // La validación local da respuesta inmediata; el backend vuelve a comprobarla.
    if (!isValidNewPassword(newPassword)) {
      setError("ui.la.nueva.contrasena.debe.tener.al.menos.8.caracteres.maximo.72.by");
      return;
    }
    if (newPassword !== confirmation) {
      setError("ui.la.confirmacion.no.coincide.con.la.nueva.contrasena");
      return;
    }

    setIsLoading(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmation("");
      setSuccess("ui.contrasena.actualizada.correctamente");
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
        <ArrowLeft size={17} />{" " + t("common.backToSettings")}</Link>
      <section className="change-password-card" aria-labelledby="change-password-title">
        <KeyRound size={28} aria-hidden="true" />
        <h1 id="change-password-title">{t("ui.cambiar.contrasena")}</h1>
        <p>{t("ui.confirma.tu.contrasena.actual.y.elige.una.nueva")}</p>

        {error && <p className="change-password-error" role="alert">{localizeMessage(error, t)}</p>}
        {success && <p className="change-password-success" role="status">{localizeMessage(success, t)}</p>}

        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="current-password">{t("ui.contrasena.actual")}</label>
          <input id="current-password" type="password" value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)} autoComplete="current-password" disabled={isLoading} />

          <label htmlFor="new-password">{t("auth.newPassword")}</label>
          <input id="new-password" type="password" value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)} autoComplete="new-password" disabled={isLoading} />
          <small>{t("ui.al.menos.8.caracteres.y.maximo.72.bytes.utf.8")}</small>

          <label htmlFor="confirm-password">{t("ui.confirmar.nueva.contrasena")}</label>
          <input id="confirm-password" type="password" value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)} autoComplete="new-password" disabled={isLoading} />

          <button type="submit" disabled={isLoading} aria-busy={isLoading}>
            {isLoading ? t("auth.updating") : t("auth.updatePassword")}
          </button>
        </form>
      </section>
    </main>
  );
};
