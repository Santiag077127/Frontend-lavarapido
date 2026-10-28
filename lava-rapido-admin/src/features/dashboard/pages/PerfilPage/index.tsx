// Muestra y actualiza los datos del perfil.
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { ArrowLeft, Mail, Phone, Save } from "lucide-react";
import { Link } from "react-router-dom";

import { useAuthStore } from "../../../../store/authStore";
import { ThemeContext, localizeMessage, useTranslations } from "../../../../theme/theme";
import { AvatarDisplay } from "../../components/AvatarDisplay/AvatarDisplay";
import { getProfile, updateProfile } from "../../services/userService";
import { AVATAR_OPTIONS, type UserProfile, type AvatarId } from "../../types";
import { containsEmoji } from "@/shared/textValidation";
import "@/styles/settingsBackLink.css";
import "./PerfilPage.css";

type ProfileForm = Pick<UserProfile, "firstName" | "lastName" | "phoneNumber" | "profilePicture" | "email">;
type ProfileFieldErrors = Partial<Record<keyof Pick<ProfileForm, "firstName" | "lastName" | "phoneNumber" | "email">, string>>;

const EMPTY_FORM: ProfileForm = {
  email: "",
  firstName: "",
  lastName: "",
  phoneNumber: "",
  profilePicture: "avatar_1",
};

const isAvatarId = (value: string): value is AvatarId =>
  AVATAR_OPTIONS.includes(value as AvatarId);

const NAME_REGEX = /^[\p{L}\p{M}\s'-]+$/u;

const validateProfileField = (name: keyof ProfileFieldErrors, value: string) => {
  if (name === "email") {
    if (containsEmoji(value)) return "profile.noEmoji";
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) && value.trim().length <= 100 ? "" : "profile.emailInvalid";
  }
  if (name === "phoneNumber") {
    return /^\d{10}$/.test(value)
      ? ""
      : "ui.el.telefono.solo.puede.contener.numeros.y.debe.tener.10.digitos";
  }

  if (!value.trim()) return "ui.este.campo.es.obligatorio";
  if (containsEmoji(value)) return "profile.noEmoji";
  if (!NAME_REGEX.test(value)) return "ui.el.nombre.no.puede.contener.numeros.ni.simbolos";
  return value.trim().length < 3 ? "ui.debe.tener.minimo.3.caracteres" : "";
};

export const PerfilPage = () => {
  const theme = useContext(ThemeContext);
  const t = useTranslations();
  const loggedUser = useAuthStore((state) => state.user);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [form, setForm] = useState<ProfileForm>(EMPTY_FORM);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<ProfileFieldErrors>({});

  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        setCargando(true);
        setError(null);
        const data = await getProfile();
        setProfile(data);
        setForm({
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          phoneNumber: data.phoneNumber,
          // profilePicture es un identificador textual temporal, no una imagen real.
          profilePicture: isAvatarId(data.profilePicture) ? data.profilePicture : AVATAR_OPTIONS[0],
        });
        setFieldErrors({});
      } catch {
        setError("ui.no.se.pudo.cargar.tu.perfil.intenta.de.nuevo");
      } finally {
        setCargando(false);
      }
    };

    cargarPerfil();
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const fieldName = name as keyof ProfileFieldErrors;
    if (fieldName !== "phoneNumber" && containsEmoji(value)) {
      setFieldErrors((current) => ({ ...current, [fieldName]: "profile.noEmoji" }));
      setMensaje(null);
      return;
    }
    const nextValue = fieldName === "email" ? value : fieldName === "phoneNumber"
      ? value.replace(/\D/g, "")
      : value;

    setForm((current) => ({ ...current, [name]: nextValue }));
    setFieldErrors((current) => ({
      ...current,
      [fieldName]: nextValue !== value
        ? fieldName === "phoneNumber"
          ? "ui.el.telefono.solo.puede.contener.numeros"
          : "ui.el.nombre.no.puede.contener.numeros.ni.simbolos"
        : validateProfileField(fieldName, nextValue),
    }));
    setMensaje(null);
  };

  // Valida en pantalla y envía solo los campos editables del perfil.
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMensaje(null);
    setError(null);

    const errors: ProfileFieldErrors = {
      email: validateProfileField("email", form.email),
      firstName: validateProfileField("firstName", form.firstName),
      lastName: validateProfileField("lastName", form.lastName),
      phoneNumber: validateProfileField("phoneNumber", form.phoneNumber),
    };
    setFieldErrors(errors);

    if (Object.values(errors).some(Boolean)) {
      setError("ui.corrige.los.campos.marcados.antes.de.guardar");
      return;
    }

    try {
      setGuardando(true);
      const updated = await updateProfile({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phoneNumber: form.phoneNumber,
        profilePicture: form.profilePicture,
      });
      const refreshed = await getProfile();
      const currentProfile = refreshed || updated;
      setProfile(currentProfile);
      setForm({
        email: currentProfile.email,
        firstName: currentProfile.firstName,
        lastName: currentProfile.lastName,
        phoneNumber: currentProfile.phoneNumber,
        profilePicture: currentProfile.profilePicture,
      });
      setMensaje("ui.perfil.actualizado.correctamente");
    } catch (err) {
      const status = axios.isAxiosError(err) ? err.response?.status : undefined;
      setError(status === 409 ? "auth.emailAlreadyUsed" : status === 400 ? "profile.emailOrPasswordInvalid" : status === 401 ? "profile.sessionChanged" : "ui.no.se.pudo.actualizar.tu.perfil.intenta.de.nuevo");
    } finally {
      setGuardando(false);
    }
  };

  const email = profile?.email || loggedUser?.email || "ui.no.disponible";

  return (
    <div className="page-perfil">
      <div className="page-header">
        <div>
          <Link to="/dashboard/configuracion" className="settings-back-link">
            <ArrowLeft size={17} />
            {t("common.backToSettings")}
          </Link>
          <h1>{t("profile.title")}</h1>
          <p>{t("profile.subtitle")}</p>
        </div>
      </div>

      {error && <p className="page-error" role="alert">{localizeMessage(error, t)}</p>}
      {mensaje && <p className="page-success" role="status">{localizeMessage(mensaje, t)}</p>}

      {cargando ? (
        <p className="page-loading">{t("ui.cargando.perfil")}</p>
      ) : (
        <section className="perfil-card" aria-label={t("ui.informacion.del.perfil")}>
          <div className="perfil-avatar" aria-hidden="true">
            <AvatarDisplay avatarId={form.profilePicture} />
          </div>

          <div className="perfil-info">
            <h2>{[profile?.firstName || loggedUser?.firstName, profile?.lastName].filter(Boolean).join(" ") || t("ui.no.disponible")}</h2>
            <span className="perfil-role">{t("profile.role")}</span>

            <dl className="perfil-details">
              <div>
                <dt><Mail size={17} aria-hidden="true" />{" " + t("auth.email")}</dt>
                <dd>{localizeMessage(email, t)}</dd>
              </div>
            </dl>

            <form className="perfil-form" onSubmit={handleSubmit}>
              <label>{t("auth.email")}<input className={fieldErrors.email ? "perfil-input--error" : ""} name="email" type="email" value={form.email} readOnly maxLength={100} required />
                {fieldErrors.email && <small className="perfil-field-error">{localizeMessage(fieldErrors.email, t)}</small>}
              </label>
              <label>{t("services.name")}<input className={fieldErrors.firstName ? "perfil-input--error" : ""} name="firstName" value={form.firstName} onChange={handleChange} required />
                {fieldErrors.firstName && <small className="perfil-field-error">{localizeMessage(fieldErrors.firstName, t)}</small>}
              </label>
              <label>{t("ui.apellido")}<input className={fieldErrors.lastName ? "perfil-input--error" : ""} name="lastName" value={form.lastName} onChange={handleChange} required />
                {fieldErrors.lastName && <small className="perfil-field-error">{localizeMessage(fieldErrors.lastName, t)}</small>}
              </label>
              <label>
                <span><Phone size={16} aria-hidden="true" />{" " + t("ui.telefono")}</span>
                <input className={fieldErrors.phoneNumber ? "perfil-input--error" : ""} name="phoneNumber" type="tel" inputMode="numeric" value={form.phoneNumber} onChange={handleChange} maxLength={10} required />
                {fieldErrors.phoneNumber && <small className="perfil-field-error">{localizeMessage(fieldErrors.phoneNumber, t)}</small>}
              </label>
              <fieldset className="perfil-avatar-selector">
                <legend>{t("ui.foto.de.perfil")}</legend>
                <div className="perfil-avatar-options">
                  {AVATAR_OPTIONS.map((avatarId) => (
                    <button
                      className={`perfil-avatar-option ${form.profilePicture === avatarId ? "perfil-avatar-option--selected" : ""}`}
                      type="button"
                      key={avatarId}
                      onClick={() => {
                        setForm((current) => ({ ...current, profilePicture: avatarId }));
                        setMensaje(null);
                      }}
                      aria-label={`Seleccionar ${avatarId}`}
                      aria-pressed={form.profilePicture === avatarId}
                    >
                      <AvatarDisplay avatarId={avatarId} />
                      {form.profilePicture === avatarId && <span className="perfil-avatar-check" aria-hidden="true">✓</span>}
                    </button>
                  ))}
                </div>
                <small>{t("ui.selecciona.un.avatar.predeterminado")}</small>
              </fieldset>

              <button className="perfil-save" type="submit" disabled={guardando}>
                <Save size={17} aria-hidden="true" />
                {guardando ? t("profile.saving") : t("profile.save")}
              </button>
            </form>
          </div>
        </section>
      )}
    </div>
  );
};
