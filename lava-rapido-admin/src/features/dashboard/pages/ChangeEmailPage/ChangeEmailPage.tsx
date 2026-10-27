import { useState, type FormEvent } from "react";
import { ArrowLeft, Mail } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuthStore } from "@/store/authStore";
import { formatTranslation, useTranslations } from "@/theme/theme";
import { changeEmail } from "../../services/userService";
import { containsEmoji } from "@/shared/textValidation";
import { PasswordVisibilityField } from "../../components/PasswordVisibilityField/PasswordVisibilityField";
import "../ChangePasswordPage/ChangePasswordPage.css";
import "./ChangeEmailPage.css";

export const ChangeEmailPage = () => {
  const navigate = useNavigate();
  const t = useTranslations();
  const currentEmail = useAuthStore((state) => state.user?.email ?? "");
  const logout = useAuthStore((state) => state.logout);
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [emailContainsEmoji, setEmailContainsEmoji] = useState(false);

  const normalizedEmail = newEmail.trim().toLowerCase();
  const handleEmailChange = (value: string) => {
    if (containsEmoji(value)) {
      setEmailContainsEmoji(true);
      setError(t("emailChange.noEmoji"));
      return;
    }
    setEmailContainsEmoji(false);
    setError("");
    setNewEmail(value);
  };
  const validate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (emailContainsEmoji) return;
    setError("");
    if (!normalizedEmail || !currentPassword) return setError(t("emailChange.required"));
    if (containsEmoji(normalizedEmail)) return setError(t("emailChange.noEmoji"));
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) || normalizedEmail.length > 100) return setError(t("emailChange.invalid"));
    if (normalizedEmail === currentEmail.trim().toLowerCase()) return setError(t("emailChange.same"));
    setConfirming(true);
  };

  const confirmChange = async () => {
    if (saving) return;
    setSaving(true);
    setError("");
    try {
      await changeEmail(normalizedEmail, currentPassword);
      logout();
      navigate("/login", { replace: true, state: { notice: "emailChange.success" } });
    } catch (requestError) {
      const status = axios.isAxiosError(requestError) ? requestError.response?.status : undefined;
      const code = axios.isAxiosError(requestError) ? requestError.response?.data?.error : undefined;
      setError(t(status === 409 ? "emailChange.conflict"
        : status === 400 && code === "CURRENT_PASSWORD_INVALID" ? "emailChange.incorrectPassword"
        : status === 400 ? "emailChange.badRequest"
        : status === 403 ? "emailChange.forbidden"
        : "emailChange.error"));
      setConfirming(false);
    } finally {
      setSaving(false);
    }
  };

  return <main className="change-password-page change-email-page">
    <Link className="settings-back-link" to="/dashboard/configuracion"><ArrowLeft size={17} /> {t("common.backToSettings")}</Link>
    <section className="change-password-card" aria-labelledby="change-email-title">
      <Mail size={28} aria-hidden="true" />
      <h1 id="change-email-title">{t("emailChange.title")}</h1>
      <p>{t("emailChange.subtitle")}</p>
      <p className="change-email-current">{t("emailChange.current")} <strong>{currentEmail}</strong></p>
      {error && <p className="change-password-error" role="alert">{error}</p>}
      <form onSubmit={validate} noValidate>
        <label htmlFor="new-email">{t("emailChange.new")}</label>
        <input id="new-email" type="email" value={newEmail} onChange={(event) => handleEmailChange(event.target.value)} onBlur={() => setNewEmail((current) => current.trim())} autoComplete="email" maxLength={100} disabled={saving} required />
        <PasswordVisibilityField id="email-current-password" label={t("profile.currentPassword")} value={currentPassword}
          onChange={setCurrentPassword} autoComplete="current-password" disabled={saving} required />
        <small>{t("emailChange.securityHint")}</small>
        <button type="submit" disabled={saving}>{t("emailChange.submit")}</button>
      </form>
    </section>
    {confirming && <div className="change-email-overlay" role="presentation">
      <div className="change-email-confirm" role="alertdialog" aria-modal="true" aria-labelledby="change-email-confirm-title" aria-describedby="change-email-confirm-description">
        <h2 id="change-email-confirm-title">{t("emailChange.confirmTitle")}</h2>
        <p id="change-email-confirm-description">{formatTranslation(t("emailChange.confirmDescription"), { old: currentEmail, next: normalizedEmail })}</p>
        <div className="change-email-actions">
          <button type="button" onClick={() => setConfirming(false)} disabled={saving}>{t("common.back")}</button>
          <button type="button" onClick={confirmChange} disabled={saving}>{saving ? t("emailChange.saving") : t("emailChange.confirmAction")}</button>
        </div>
      </div>
    </div>}
  </main>;
};
