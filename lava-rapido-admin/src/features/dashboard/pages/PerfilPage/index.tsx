import { useContext, useEffect, useState } from "react";
import { ArrowLeft, Mail, Phone, Save } from "lucide-react";
import { Link } from "react-router-dom";

import { useAuthStore } from "../../../../store/authStore";
import { ThemeContext } from "../../../../theme/theme";
import { AvatarDisplay } from "../../components/AvatarDisplay/AvatarDisplay";
import { getProfile, updateProfile } from "../../services/userService";
import { AVATAR_OPTIONS, type UserProfile, type AvatarId } from "../../types";
import "./PerfilPage.css";

type ProfileForm = Pick<UserProfile, "firstName" | "lastName" | "phoneNumber" | "profilePicture">;
type ProfileFieldErrors = Partial<Record<keyof Pick<ProfileForm, "firstName" | "lastName" | "phoneNumber">, string>>;

const EMPTY_FORM: ProfileForm = {
  firstName: "",
  lastName: "",
  phoneNumber: "",
  profilePicture: "avatar_1",
};

const isAvatarId = (value: string): value is AvatarId =>
  AVATAR_OPTIONS.includes(value as AvatarId);

const NAME_REGEX = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$/;

const validateProfileField = (name: keyof ProfileFieldErrors, value: string) => {
  if (name === "phoneNumber") {
    return /^\d{10}$/.test(value)
      ? ""
      : "El teléfono solo puede contener números y debe tener 10 dígitos.";
  }

  if (!value.trim()) return "Este campo es obligatorio.";
  if (!NAME_REGEX.test(value)) return "El nombre no puede contener números ni símbolos.";
  return value.trim().length < 3 ? "Debe tener mínimo 3 caracteres." : "";
};

export const PerfilPage = () => {
  const theme = useContext(ThemeContext);
  const t = theme?.t ?? ((key: string) => key);
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
          firstName: data.firstName,
          lastName: data.lastName,
          phoneNumber: data.phoneNumber,
          // profilePicture es un identificador textual temporal, no una imagen real.
          profilePicture: isAvatarId(data.profilePicture) ? data.profilePicture : AVATAR_OPTIONS[0],
        });
        setFieldErrors({});
      } catch {
        setError("No se pudo cargar tu perfil. Intenta de nuevo.");
      } finally {
        setCargando(false);
      }
    };

    cargarPerfil();
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const fieldName = name as keyof ProfileFieldErrors;
    const sanitizedValue = fieldName === "phoneNumber"
      ? value.replace(/\D/g, "")
      : value.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]/g, "");

    setForm((current) => ({ ...current, [name]: sanitizedValue }));
    setFieldErrors((current) => ({
      ...current,
      [fieldName]: sanitizedValue !== value
        ? fieldName === "phoneNumber"
          ? "El teléfono solo puede contener números."
          : "El nombre no puede contener números ni símbolos."
        : validateProfileField(fieldName, sanitizedValue),
    }));
    setMensaje(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMensaje(null);
    setError(null);

    const errors: ProfileFieldErrors = {
      firstName: validateProfileField("firstName", form.firstName),
      lastName: validateProfileField("lastName", form.lastName),
      phoneNumber: validateProfileField("phoneNumber", form.phoneNumber),
    };
    setFieldErrors(errors);

    if (Object.values(errors).some(Boolean)) {
      setError("Corrige los campos marcados antes de guardar.");
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
        firstName: currentProfile.firstName,
        lastName: currentProfile.lastName,
        phoneNumber: currentProfile.phoneNumber,
        profilePicture: currentProfile.profilePicture,
      });
      setMensaje("Perfil actualizado correctamente.");
    } catch {
      setError("No se pudo actualizar tu perfil. Intenta de nuevo.");
    } finally {
      setGuardando(false);
    }
  };

  const email = profile?.email || loggedUser?.email || "No disponible";

  return (
    <div className="page-perfil">
      <div className="page-header">
        <div>
          <Link to="/dashboard/configuracion" className="perfil-back-link">
            <ArrowLeft size={17} />
            {t("common.backToSettings")}
          </Link>
          <h1>{t("profile.title")}</h1>
          <p>{t("profile.subtitle")}</p>
        </div>
      </div>

      {error && <p className="page-error" role="alert">{error}</p>}
      {mensaje && <p className="page-success" role="status">{mensaje}</p>}

      {cargando ? (
        <p className="page-loading">Cargando perfil...</p>
      ) : (
        <section className="perfil-card" aria-label="Información del perfil">
          <div className="perfil-avatar" aria-hidden="true">
            <AvatarDisplay avatarId={form.profilePicture} />
          </div>

          <div className="perfil-info">
            <h2>{[form.firstName, form.lastName].filter(Boolean).join(" ") || t("profile.role")}</h2>
            <span className="perfil-role">{t("profile.role")}</span>

            <dl className="perfil-details">
              <div>
                <dt><Mail size={17} aria-hidden="true" /> Correo electrónico</dt>
                <dd>{email}</dd>
              </div>
            </dl>

            <form className="perfil-form" onSubmit={handleSubmit}>
              <label>
                Nombre
                <input className={fieldErrors.firstName ? "perfil-input--error" : ""} name="firstName" value={form.firstName} onChange={handleChange} required />
                {fieldErrors.firstName && <small className="perfil-field-error">{fieldErrors.firstName}</small>}
              </label>
              <label>
                Apellido
                <input className={fieldErrors.lastName ? "perfil-input--error" : ""} name="lastName" value={form.lastName} onChange={handleChange} required />
                {fieldErrors.lastName && <small className="perfil-field-error">{fieldErrors.lastName}</small>}
              </label>
              <label>
                <span><Phone size={16} aria-hidden="true" /> Teléfono</span>
                <input className={fieldErrors.phoneNumber ? "perfil-input--error" : ""} name="phoneNumber" type="tel" inputMode="numeric" value={form.phoneNumber} onChange={handleChange} maxLength={10} required />
                {fieldErrors.phoneNumber && <small className="perfil-field-error">{fieldErrors.phoneNumber}</small>}
              </label>
              <fieldset className="perfil-avatar-selector">
                <legend>Foto de perfil</legend>
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
                <small>Selecciona un avatar predeterminado.</small>
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
