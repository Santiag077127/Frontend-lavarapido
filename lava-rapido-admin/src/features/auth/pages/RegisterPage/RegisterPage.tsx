import "./RegisterPage.css";

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { HomeButton } from "../../components/HomeButton/HomeButton";
import { register } from "../../services/authService";
import type { RegisterPayload } from "../../types";

const INITIAL_FORM: RegisterPayload = {
  firstName: "", lastName: "", email: "", phoneNumber: "", documentType: "CC", documentNumber: "", password: "",
};

type FieldName = keyof RegisterPayload | "confirmPassword";
type FieldErrors = Partial<Record<FieldName | "consents", string>>;

const NAME_REGEX = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$/;
const DIGITS_REGEX = /^\d+$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

const validateField = (field: FieldName, value: string, form: RegisterPayload): string => {
  switch (field) {
    case "firstName": case "lastName":
      if (!value.trim()) return "Este campo es obligatorio.";
      if (!NAME_REGEX.test(value)) return "El nombre no puede contener números ni símbolos.";
      return value.trim().length < 3 ? "El nombre debe tener mínimo 3 caracteres." : "";
    case "documentNumber":
      if (!DIGITS_REGEX.test(value)) return "La cédula solo puede contener números.";
      return value.length < 6 || value.length > 10 ? "La cédula debe tener entre 6 y 10 dígitos." : "";
    case "phoneNumber":
      return /^\d{10}$/.test(value) ? "" : "El número de teléfono solo puede contener números y debe tener 10 dígitos.";
    case "email": return EMAIL_REGEX.test(value) ? "" : "Ingresa un correo electrónico válido.";
    case "password":
      return PASSWORD_REGEX.test(value) ? "" : "La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula y un número.";
    case "confirmPassword": return value === form.password && value.length > 0 ? "" : "Las contraseñas no coinciden.";
    default: return "";
  }
};

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<RegisterPayload>(INITIAL_FORM);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touchedFields, setTouchedFields] = useState<Partial<Record<FieldName, boolean>>>({});
  const [acceptsDataPolicy, setAcceptsDataPolicy] = useState(false);
  const [acceptsTerms, setAcceptsTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const allFieldErrors = useMemo<FieldErrors>(() => ({
    firstName: validateField("firstName", form.firstName, form), lastName: validateField("lastName", form.lastName, form),
    documentNumber: validateField("documentNumber", form.documentNumber, form), phoneNumber: validateField("phoneNumber", form.phoneNumber, form),
    email: validateField("email", form.email, form), password: validateField("password", form.password, form),
    confirmPassword: validateField("confirmPassword", confirmPassword, form),
  }), [form, confirmPassword]);

  const isFormValid = Object.values(allFieldErrors).every((validationError) => !validationError)
    && Object.values(fieldErrors).every((validationError) => !validationError)
    && acceptsDataPolicy && acceptsTerms && !isLoading;

  const setValidationError = (field: FieldName, value: string, nextForm: RegisterPayload) => {
    setFieldErrors((currentErrors) => ({ ...currentErrors, [field]: validateField(field, value, nextForm) }));
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    const field = name as keyof RegisterPayload;
    let sanitizedValue = value;
    if (field === "firstName" || field === "lastName") sanitizedValue = value.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]/g, "");
    if (field === "documentNumber" || field === "phoneNumber") sanitizedValue = value.replace(/\D/g, "");

    const nextForm = { ...form, [field]: sanitizedValue };
    setForm(nextForm);
    setTouchedFields((currentTouched) => ({ ...currentTouched, [field]: true }));

    const invalidCharacterWasEntered = sanitizedValue !== value;
    const errorMessage = invalidCharacterWasEntered
      ? field === "documentNumber" ? "La cédula solo puede contener números."
        : field === "phoneNumber" ? "El número de teléfono solo puede contener números y debe tener 10 dígitos."
          : "El nombre no puede contener números ni símbolos."
      : validateField(field, sanitizedValue, nextForm);
    setFieldErrors((currentErrors) => ({ ...currentErrors, [field]: errorMessage }));
    if (field === "password") setValidationError("confirmPassword", confirmPassword, nextForm);
  };

  const handleConfirmPasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setConfirmPassword(value);
    setTouchedFields((currentTouched) => ({ ...currentTouched, confirmPassword: true }));
    setValidationError("confirmPassword", value, form);
  };

  const handleConsentChange = (consent: "dataPolicy" | "terms", checked: boolean) => {
    const nextDataPolicy = consent === "dataPolicy" ? checked : acceptsDataPolicy;
    const nextTerms = consent === "terms" ? checked : acceptsTerms;
    setAcceptsDataPolicy(nextDataPolicy); setAcceptsTerms(nextTerms);
    setFieldErrors((currentErrors) => ({ ...currentErrors, consents: nextDataPolicy && nextTerms ? "" : "Debes aceptar el tratamiento de datos y los términos para continuar." }));
  };

  const getInputClassName = (field: FieldName) => {
    const value = field === "confirmPassword" ? confirmPassword : form[field as keyof RegisterPayload] ?? "";
    if (!value) return "rp-input";
    return `rp-input ${(fieldErrors[field] || allFieldErrors[field]) ? "rp-input--error" : "rp-input--valid"}`;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); setError("");
    setTouchedFields({ firstName: true, lastName: true, documentNumber: true, phoneNumber: true, email: true, password: true, confirmPassword: true });
    setFieldErrors({ ...allFieldErrors, consents: acceptsDataPolicy && acceptsTerms ? "" : "Debes aceptar el tratamiento de datos y los términos para continuar." });
    if (!isFormValid) return;

    setIsLoading(true);
    try {
      await register(form); setSuccess(true); setTimeout(() => navigate("/"), 2500);
    } catch (requestError: any) {
      const status = requestError.response?.status;
      const apiMessage = requestError.response?.data?.message || requestError.response?.data?.error;
      const visibleMessage = apiMessage || "No fue posible crear la cuenta. Inténtalo de nuevo.";
      const message = String(visibleMessage).toLowerCase();
      if (status === 400 || status === 409) {
        if (message.includes("correo") || message.includes("email")) setFieldErrors((current) => ({ ...current, email: visibleMessage }));
        if (message.includes("cédula") || message.includes("cedula") || message.includes("document")) setFieldErrors((current) => ({ ...current, documentNumber: visibleMessage }));
        setError(visibleMessage);
      } else if (status >= 500) setError("Error del servidor. Inténtalo de nuevo más tarde.");
      else setError("Error de conexión. Verifica tu internet.");
    } finally { setIsLoading(false); }
  };

  const renderFieldError = (field: FieldName) => touchedFields[field] && fieldErrors[field] ? <p className="rp-field-error">{fieldErrors[field]}</p> : null;

  if (success) return <div className="rp-page"><HomeButton /><div className="rp-success-box"><span className="rp-success-icon">✓</span><h2 className="rp-success-title">¡Registro exitoso!</h2><p className="rp-success-msg">Tu cuenta fue creada correctamente.<br />Serás redirigido al inicio…</p></div></div>;

  return (
    <div className="rp-page"><HomeButton /><div className="rp-card">
      <div className="rp-header"><h2 className="rp-title">Crear cuenta</h2><p className="rp-subtitle">Registro para usuarios en Lava Rápido móvil</p></div>
      {error && <div className="rp-error" role="alert" aria-live="polite"><span className="rp-error-icon">⚠</span>{error}</div>}
      <form onSubmit={handleSubmit} noValidate>
        <p className="rp-section-label">Datos personales</p>
        <div className="rp-row">
          <div className="rp-field"><label className="rp-label" htmlFor="rp-first-name">Nombre <span className="rp-required">*</span></label><input id="rp-first-name" name="firstName" type="text" placeholder="Ej: Carlos" value={form.firstName} onChange={handleChange} className={getInputClassName("firstName")} autoComplete="given-name" aria-required="true" aria-invalid={Boolean(fieldErrors.firstName)} />{renderFieldError("firstName")}</div>
          <div className="rp-field"><label className="rp-label" htmlFor="rp-last-name">Apellido <span className="rp-required">*</span></label><input id="rp-last-name" name="lastName" type="text" placeholder="Ej: Rojas" value={form.lastName} onChange={handleChange} className={getInputClassName("lastName")} autoComplete="family-name" aria-required="true" aria-invalid={Boolean(fieldErrors.lastName)} />{renderFieldError("lastName")}</div>
        </div>
        <div className="rp-row">
          <div className="rp-field rp-field--sm"><label className="rp-label" htmlFor="rp-doc-type">Tipo doc. <span className="rp-required">*</span></label><select id="rp-doc-type" name="documentType" value={form.documentType} onChange={handleChange} className="rp-select" aria-required="true"><option value="CC">CC</option><option value="TI">TI</option><option value="CE">CE</option></select></div>
          <div className="rp-field"><label className="rp-label" htmlFor="rp-doc-number">Cédula de ciudadanía <span className="rp-required">*</span></label><input id="rp-doc-number" name="documentNumber" inputMode="numeric" type="text" placeholder="Ej: 1075123456" value={form.documentNumber} onChange={handleChange} className={getInputClassName("documentNumber")} aria-required="true" aria-invalid={Boolean(fieldErrors.documentNumber)} maxLength={10} />{renderFieldError("documentNumber")}</div>
        </div>
        <div className="rp-field"><label className="rp-label" htmlFor="rp-phone">Teléfono <span className="rp-required">*</span></label><input id="rp-phone" name="phoneNumber" inputMode="numeric" type="tel" placeholder="Ej: 3101234567" value={form.phoneNumber} onChange={handleChange} className={getInputClassName("phoneNumber")} autoComplete="tel" aria-required="true" aria-invalid={Boolean(fieldErrors.phoneNumber)} maxLength={10} />{renderFieldError("phoneNumber")}</div>
        <p className="rp-section-label">Acceso</p>
        <div className="rp-field"><label className="rp-label" htmlFor="rp-email">Correo electrónico <span className="rp-required">*</span></label><input id="rp-email" name="email" type="email" placeholder="ejemplo@correo.com" value={form.email} onChange={handleChange} className={getInputClassName("email")} autoComplete="email" aria-required="true" aria-invalid={Boolean(fieldErrors.email)} />{renderFieldError("email")}</div>
        <div className="rp-row">
          <div className="rp-field"><label className="rp-label" htmlFor="rp-password">Contraseña <span className="rp-required">*</span></label><input id="rp-password" name="password" type="password" placeholder="Mín. 8 caracteres" value={form.password} onChange={handleChange} className={getInputClassName("password")} autoComplete="new-password" aria-required="true" aria-invalid={Boolean(fieldErrors.password)} />{renderFieldError("password")}</div>
          <div className="rp-field"><label className="rp-label" htmlFor="rp-confirm">Confirmar contraseña <span className="rp-required">*</span></label><input id="rp-confirm" name="confirmPassword" type="password" placeholder="Repite la contraseña" value={confirmPassword} onChange={handleConfirmPasswordChange} className={getInputClassName("confirmPassword")} autoComplete="new-password" aria-required="true" aria-invalid={Boolean(fieldErrors.confirmPassword)} />{renderFieldError("confirmPassword")}</div>
        </div>
        <div className="rp-consents">
          <label className="rp-consent"><input type="checkbox" checked={acceptsDataPolicy} onChange={(event) => handleConsentChange("dataPolicy", event.target.checked)} /><span>Acepto el tratamiento de mis datos personales conforme a la <a href="#politica-de-privacidad">política de privacidad</a>.</span></label>
          <label className="rp-consent"><input type="checkbox" checked={acceptsTerms} onChange={(event) => handleConsentChange("terms", event.target.checked)} /><span>Acepto los términos y condiciones del servicio.</span></label>
          {fieldErrors.consents && (!acceptsDataPolicy || !acceptsTerms) && <p className="rp-field-error">{fieldErrors.consents}</p>}
        </div>
        <button className="rp-btn" type="submit" disabled={!isFormValid} aria-busy={isLoading}>{isLoading && <svg className="rp-spinner" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeDashoffset="10" /></svg>}{isLoading ? "Registrando…" : "Registrarse"}</button>
      </form>
    </div></div>
  );
};
