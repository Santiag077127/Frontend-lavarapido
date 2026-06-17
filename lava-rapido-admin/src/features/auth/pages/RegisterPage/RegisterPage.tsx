import "./RegisterPage.css";

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import { register } from "../../services/authService";
import type { RegisterPayload } from "../../types";

const INITIAL_FORM: RegisterPayload = {
  first_name:      "",
  last_name:       "",
  email:           "",
  phone_number:    "",
  document_type:   "CC",
  document_number: "",
  password:        "",
};

export const RegisterPage = () => {
  const navigate = useNavigate();

  const [form, setForm]           = useState<RegisterPayload>(INITIAL_FORM);
  const [confirmPass, setConfirmPass] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ── Validaciones alineadas con los constraints de la BD ──
  const validate = (): string => {
    if (!form.first_name.trim())      return "El nombre es obligatorio.";
    if (!form.document_type)          return "Selecciona el tipo de documento.";
    if (!form.document_number.trim()) return "El número de documento es obligatorio.";

    const phoneRegex = /^3[0-9]{9}$/;
    if (!phoneRegex.test(form.phone_number))
      return "El teléfono debe empezar por 3 y tener 10 dígitos (ej: 3101234567).";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email))
      return "Ingresa un correo electrónico válido.";

    // Política de contraseña del RF1.4: mín 8 chars, mayúscula, minúscula y número
    const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passRegex.test(form.password))
      return "La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula y un número.";

    if (form.password !== confirmPass)
      return "Las contraseñas no coinciden.";

    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setIsLoading(true);
    try {
      await register(form);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2500);
    } catch (err: any) {
      if (err.response?.status === 409) {
        setError("El correo electrónico ya está registrado.");
      } else if (err.response?.status >= 500) {
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
      <div className="rp-page">
        <div className="rp-success-box">
          <span className="rp-success-icon">✓</span>
          <h2 className="rp-success-title">¡Registro exitoso!</h2>
          <p className="rp-success-msg">
            Tu cuenta fue creada correctamente.<br />
            Serás redirigido al inicio de sesión…
          </p>
        </div>
      </div>
    );
  }

  return (
  <div className="rp-page">

    {/* ── Botón volver fuera de la tarjeta ── */}
    <button
      type="button"
      className="rp-back-btn"
      onClick={() => navigate("/")}
    >
      Volver al inicio
    </button>

    <div className="rp-card">

      {/* Encabezado */}
      <div className="rp-header">
        <h2 className="rp-title">Crear cuenta</h2>
        <p className="rp-subtitle">Registro para usuarios en Lava Rápido móvil</p>
      </div>

      {/* Error global */}
      {error && (
        <div className="rp-error" role="alert" aria-live="polite">
          <span className="rp-error-icon">⚠</span>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>

          {/* ── Sección: Datos personales ── */}
          <p className="rp-section-label">Datos personales</p>

          <div className="rp-row">
            <div className="rp-field">
              <label className="rp-label" htmlFor="rp-first-name">
                Nombre <span className="rp-required">*</span>
              </label>
              <input
                id="rp-first-name"
                name="first_name"
                type="text"
                placeholder="Ej: Carlos"
                value={form.first_name}
                onChange={handleChange}
                className="rp-input"
                autoComplete="given-name"
                aria-required="true"
              />
            </div>

            <div className="rp-field">
              <label className="rp-label" htmlFor="rp-last-name">
                Apellido
              </label>
              <input
                id="rp-last-name"
                name="last_name"
                type="text"
                placeholder="Ej: Rojas"
                value={form.last_name}
                onChange={handleChange}
                className="rp-input"
                autoComplete="family-name"
              />
            </div>
          </div>

          <div className="rp-row">
            <div className="rp-field rp-field--sm">
              <label className="rp-label" htmlFor="rp-doc-type">
                Tipo doc. <span className="rp-required">*</span>
              </label>
              <select
                id="rp-doc-type"
                name="document_type"
                value={form.document_type}
                onChange={handleChange}
                className="rp-select"
                aria-required="true"
              >
                <option value="CC">CC</option>
                <option value="TI">TI</option>
                <option value="CE">CE</option>
              </select>
            </div>

            <div className="rp-field">
              <label className="rp-label" htmlFor="rp-doc-number">
                Número de documento <span className="rp-required">*</span>
              </label>
              <input
                id="rp-doc-number"
                name="document_number"
                type="text"
                placeholder="Ej: 1075123456"
                value={form.document_number}
                onChange={handleChange}
                className="rp-input"
                aria-required="true"
                maxLength={12}
              />
            </div>
          </div>

          <div className="rp-field">
            <label className="rp-label" htmlFor="rp-phone">
              Teléfono <span className="rp-required">*</span>
            </label>
            <input
              id="rp-phone"
              name="phone_number"
              type="tel"
              placeholder="Ej: 3101234567"
              value={form.phone_number}
              onChange={handleChange}
              className="rp-input"
              autoComplete="tel"
              aria-required="true"
              maxLength={10}
            />
          </div>

          {/* ── Sección: Acceso ── */}
          <p className="rp-section-label">Acceso</p>

          <div className="rp-field">
            <label className="rp-label" htmlFor="rp-email">
              Correo electrónico <span className="rp-required">*</span>
            </label>
            <input
              id="rp-email"
              name="email"
              type="email"
              placeholder="ejemplo@correo.com"
              value={form.email}
              onChange={handleChange}
              className="rp-input"
              autoComplete="email"
              aria-required="true"
            />
          </div>

          <div className="rp-row">
            <div className="rp-field">
              <label className="rp-label" htmlFor="rp-password">
                Contraseña <span className="rp-required">*</span>
              </label>
              <input
                id="rp-password"
                name="password"
                type="password"
                placeholder="Mín. 8 caracteres"
                value={form.password}
                onChange={handleChange}
                className="rp-input"
                autoComplete="new-password"
                aria-required="true"
              />
            </div>

            <div className="rp-field">
              <label className="rp-label" htmlFor="rp-confirm">
                Confirmar contraseña <span className="rp-required">*</span>
              </label>
              <input
                id="rp-confirm"
                type="password"
                placeholder="Repite la contraseña"
                value={confirmPass}
                onChange={e => setConfirmPass(e.target.value)}
                className="rp-input"
                autoComplete="new-password"
                aria-required="true"
              />
            </div>
          </div>

          <button
            className="rp-btn"
            type="submit"
            disabled={isLoading}
            aria-busy={isLoading}
          >
            {isLoading && (
              <svg className="rp-spinner" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke="currentColor"
                  strokeWidth="3" strokeDasharray="40" strokeDashoffset="10" />
              </svg>
            )}
            {isLoading ? "Registrando…" : "Crear cuenta"}
          </button>

        </form>


      </div>
    </div>
  );
};