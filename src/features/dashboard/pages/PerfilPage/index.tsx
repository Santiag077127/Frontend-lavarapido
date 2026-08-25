import { useEffect, useState } from "react";
import { Mail, Phone, Save } from "lucide-react";

import { useAuthStore } from "../../../../store/authStore";
import { AvatarDisplay } from "../../components/AvatarDisplay/AvatarDisplay";
import { getProfile, updateProfile } from "../../services/userService";
import { AVATAR_OPTIONS, type UserProfile, type AvatarId } from "../../types";
import "./PerfilPage.css";

type ProfileForm = Pick<UserProfile, "firstName" | "lastName" | "phoneNumber" | "profilePicture">;

const EMPTY_FORM: ProfileForm = {
  firstName: "",
  lastName: "",
  phoneNumber: "",
  profilePicture: "avatar_1",
};

const isAvatarId = (value: string): value is AvatarId =>
  AVATAR_OPTIONS.includes(value as AvatarId);

export const PerfilPage = () => {
  const loggedUser = useAuthStore((state) => state.user);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [form, setForm] = useState<ProfileForm>(EMPTY_FORM);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

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
    setForm((current) => ({ ...current, [name]: value }));
    setMensaje(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMensaje(null);
    setError(null);

    if (!form.firstName.trim() || !form.lastName.trim() || !/^\d{10}$/.test(form.phoneNumber)) {
      setError("Ingresa nombre, apellido y un teléfono válido de 10 dígitos.");
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
          <h1>Mi perfil</h1>
          <p>Consulta y actualiza la información de tu cuenta de administrador.</p>
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
            <h2>{[form.firstName, form.lastName].filter(Boolean).join(" ") || "Administrador"}</h2>
            <span className="perfil-role">Administrador</span>

            <dl className="perfil-details">
              <div>
                <dt><Mail size={17} aria-hidden="true" /> Correo electrónico</dt>
                <dd>{email}</dd>
              </div>
            </dl>

            <form className="perfil-form" onSubmit={handleSubmit}>
              <label>
                Nombre
                <input name="firstName" value={form.firstName} onChange={handleChange} required />
              </label>
              <label>
                Apellido
                <input name="lastName" value={form.lastName} onChange={handleChange} required />
              </label>
              <label>
                <span><Phone size={16} aria-hidden="true" /> Teléfono</span>
                <input name="phoneNumber" type="tel" inputMode="numeric" value={form.phoneNumber} onChange={handleChange} maxLength={10} required />
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
                {guardando ? "Guardando..." : "Guardar cambios"}
              </button>
            </form>
          </div>
        </section>
      )}
    </div>
  );
};