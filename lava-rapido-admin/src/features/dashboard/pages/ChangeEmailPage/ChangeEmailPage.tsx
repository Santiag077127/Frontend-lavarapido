import { useRef, useState, type FormEvent } from "react";
import { ArrowLeft, LoaderCircle, Mail } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuthStore } from "@/store/authStore";
import { useTranslations } from "@/theme/theme";
import { changeEmail } from "../../services/userService";
import { containsEmoji } from "@/shared/textValidation";
import { PasswordVisibilityField } from "../../components/PasswordVisibilityField/PasswordVisibilityField";
import "../ChangePasswordPage/ChangePasswordPage.css";
import "./ChangeEmailPage.css";

const EMAIL_PATTERN = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;

const getApiErrorCode = (requestError: unknown): string | undefined => {
  if (!axios.isAxiosError(requestError)) return undefined;
  const responseData: unknown = requestError.response?.data;
  return responseData && typeof responseData === "object" && "error" in responseData
    && typeof responseData.error === "string" ? responseData.error : undefined;
};

export const ChangeEmailPage = () => {
  const navigate = useNavigate();
  const t = useTranslations();
  const currentEmail = useAuthStore((state) => state.user?.email ?? "");
  const logout = useAuthStore((state) => state.logout);
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const changeInProgress = useRef(false);
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving || changeInProgress.current || emailContainsEmoji) return;
    setError("");
    if (!normalizedEmail || !currentPassword) return setError(t("emailChange.required"));
    if (containsEmoji(normalizedEmail)) return setError(t("emailChange.noEmoji"));
    if (!EMAIL_PATTERN.test(normalizedEmail) || normalizedEmail.length > 100) {
      return setError(t("emailChange.invalid"));
    }
    if (normalizedEmail === currentEmail.trim().toLowerCase()) {
      return setError(t("emailChange.same"));
    }

    changeInProgress.current = true;
    setSaving(true);
    try {
      const updatedProfile = await changeEmail(normalizedEmail, currentPassword);
      setNewEmail("");
      setCurrentPassword("");
      logout();
      navigate("/login", {
        replace: true,
        state: { notice: "emailChange.success", email: updatedProfile.email },
      });
    } catch (requestError: unknown) {
      const status = axios.isAxiosError(requestError) ? requestError.response?.status : undefined;
      const errorCode = getApiErrorCode(requestError);
      const requestCode = axios.isAxiosError(requestError) ? requestError.code : undefined;
      setError(t(requestCode === "ECONNABORTED" || requestCode === "ETIMEDOUT" ? "emailChange.timeout"
        : requestCode === "ERR_NETWORK" || !status ? "emailChange.network"
        : status >= 500 ? "emailChange.server"
        : status === 409 ? "emailChange.conflict"
        : status === 400 && errorCode === "CURRENT_PASSWORD_INVALID" ? "emailChange.incorrectPassword"
        : status === 400 ? "emailChange.badRequest"
        : status === 403 ? "emailChange.forbidden"
        : status === 404 ? "emailChange.notFound"
        : "emailChange.error"));
    } finally {
      changeInProgress.current = false;
      setSaving(false);
    }
  };

  return <main className="change-password-page change-email-page">
    <Link className="settings-back-link" to="/dashboard/configuracion">
      <ArrowLeft size={17} /> {t("common.backToSettings")}
    </Link>
    <section className="change-password-card" aria-labelledby="change-email-title">
      <Mail size={28} aria-hidden="true" />
      <h1 id="change-email-title">{t("emailChange.title")}</h1>
      <p>{t("emailChange.subtitle")}</p>
      <p className="change-email-current">{t("emailChange.current")} <strong>{currentEmail}</strong></p>
      {error && <p className="change-password-error" role="alert">{error}</p>}
      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="new-email">{t("emailChange.new")}</label>
        <input
          id="new-email"
          type="email"
          value={newEmail}
          onChange={(event) => handleEmailChange(event.target.value)}
          onBlur={() => setNewEmail((current) => current.trim())}
          autoComplete="email"
          autoCapitalize="none"
          autoCorrect="off"
          maxLength={100}
          disabled={saving}
          required
        />
        <PasswordVisibilityField
          id="email-current-password"
          label={t("profile.currentPassword")}
          value={currentPassword}
          onChange={setCurrentPassword}
          autoComplete="current-password"
          disabled={saving}
          required
        />
        <small>{t("emailChange.securityHint")}</small>
        <button type="submit" disabled={saving} aria-busy={saving}>
          {saving && <LoaderCircle className="change-email-spinner" size={17} aria-hidden="true" />}
          {saving ? t("emailChange.saving") : t("emailChange.submit")}
        </button>
      </form>
    </section>
  </main>;
};
