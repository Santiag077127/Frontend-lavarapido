// Valida los datos del registro y envía la cuenta nueva al backend.
import "./RegisterPage.css";

import { useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext, useTranslations, localizeMessage } from "@/theme/theme";

import { HomeButton } from "../../components/HomeButton/HomeButton";
import { register } from "../../services/authService";
import type { RegisterPayload } from "../../types";
import { legalContentByLanguage } from "./legalContent";

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
      if (!value.trim()) return "ui.este.campo.es.obligatorio";
      if (!NAME_REGEX.test(value)) return "ui.el.nombre.no.puede.contener.numeros.ni.simbolos";
      return value.trim().length < 3 ? "ui.el.nombre.debe.tener.minimo.3.caracteres" : "";
    case "documentNumber":
      if (!DIGITS_REGEX.test(value)) return "ui.la.cedula.solo.puede.contener.numeros";
      return value.length < 6 || value.length > 10 ? "ui.la.cedula.debe.tener.entre.6.y.10.digitos" : "";
    case "phoneNumber":
      return /^\d{10}$/.test(value) ? "" : "ui.el.numero.de.telefono.solo.puede.contener.numeros.y.debe.tener.10";
    case "email": return EMAIL_REGEX.test(value) ? "" : "ui.ingresa.un.correo.electronico.valido";
    case "password":
      return PASSWORD_REGEX.test(value) ? "" : "ui.la.contrasena.debe.tener.minimo.8.caracteres.una.mayuscula.una.mi";
    case "confirmPassword": return value === form.password && value.length > 0 ? "" : "ui.las.contrasenas.no.coinciden";
    default: return "";
  }
};

export const RegisterPage = () => {
  const t = useTranslations();
  const language = useContext(ThemeContext)?.language ?? "es";
  const legalContent = legalContentByLanguage[language];
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
  const [legalDocument, setLegalDocument] = useState<"privacy" | "terms" | null>(null);

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
      ? field === "documentNumber" ? "ui.la.cedula.solo.puede.contener.numeros"
        : field === "phoneNumber" ? "ui.el.numero.de.telefono.solo.puede.contener.numeros.y.debe.tener.10"
          : "ui.el.nombre.no.puede.contener.numeros.ni.simbolos"
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
    setFieldErrors((currentErrors) => ({ ...currentErrors, consents: nextDataPolicy && nextTerms ? "" : "ui.debes.aceptar.el.tratamiento.de.datos.y.los.terminos.para.continu" }));
  };

  const getInputClassName = (field: FieldName) => {
    const value = field === "confirmPassword" ? confirmPassword : form[field as keyof RegisterPayload] ?? "";
    if (!value) return "rp-input";
    return `rp-input ${(fieldErrors[field] || allFieldErrors[field]) ? "rp-input--error" : "rp-input--valid"}`;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); setError("");
    setTouchedFields({ firstName: true, lastName: true, documentNumber: true, phoneNumber: true, email: true, password: true, confirmPassword: true });
    setFieldErrors({ ...allFieldErrors, consents: acceptsDataPolicy && acceptsTerms ? "" : "ui.debes.aceptar.el.tratamiento.de.datos.y.los.terminos.para.continu" });
    if (!isFormValid) return;

    setIsLoading(true);
    try {
      // Envía el formulario validado; el backend crea la cuenta y guarda el hash.
      await register(form); setSuccess(true); setTimeout(() => navigate("/"), 2500);
    } catch (requestError: any) {
      const status = requestError.response?.status;
      const apiMessage = requestError.response?.data?.message || requestError.response?.data?.error;
      const message = String(apiMessage ?? "").toLowerCase();
      if (status === 400 || status === 409) {
        if (message.includes("correo") || message.includes("email")) setFieldErrors((current) => ({ ...current, email: "auth.emailAlreadyUsed" }));
        if (message.includes("cédula") || message.includes("cedula") || message.includes("document")) setFieldErrors((current) => ({ ...current, documentNumber: "auth.documentAlreadyUsed" }));
        setError("ui.no.fue.posible.crear.la.cuenta.intentalo.de.nuevo");
      } else if (status >= 500) setError("ui.error.del.servidor.intentalo.de.nuevo.mas.tarde.2");
      else setError("ui.error.de.conexion.verifica.tu.internet.2");
    } finally { setIsLoading(false); }
  };

  const renderFieldError = (field: FieldName) => touchedFields[field] && fieldErrors[field] ? <p className="rp-field-error">{localizeMessage(fieldErrors[field], t)}</p> : null;

  if (success) return <div className="rp-page"><HomeButton /><div className="rp-success-box"><span className="rp-success-icon">✓</span><h2 className="rp-success-title">{t("ui.registro.exitoso")}</h2><p className="rp-success-msg">{t("ui.tu.cuenta.fue.creada.correctamente")}<br />{t("ui.seras.redirigido.al.inicio")}</p></div></div>;

  return (
    <div className="rp-page"><HomeButton /><div className="rp-card">
      <div className="rp-header"><h2 className="rp-title">{t("ui.crear.cuenta")}</h2><p className="rp-subtitle">{t("ui.registro.para.usuarios.en.lava.rapido.movil")}</p></div>
      {error && <div className="rp-error" role="alert" aria-live="polite"><span className="rp-error-icon">⚠</span>{localizeMessage(error, t)}</div>}
      <form onSubmit={handleSubmit} noValidate>
        <p className="rp-section-label">{t("ui.datos.personales")}</p>
        <div className="rp-row">
          <div className="rp-field"><label className="rp-label" htmlFor="rp-first-name">{t("services.name") + " "}<span className="rp-required">*</span></label><input id="rp-first-name" name="firstName" type="text" placeholder={t("form.firstNameExample")} value={form.firstName} onChange={handleChange} className={getInputClassName("firstName")} autoComplete="given-name" aria-required="true" aria-invalid={Boolean(fieldErrors.firstName)} />{renderFieldError("firstName")}</div>
          <div className="rp-field"><label className="rp-label" htmlFor="rp-last-name">{t("ui.apellido") + " "}<span className="rp-required">*</span></label><input id="rp-last-name" name="lastName" type="text" placeholder={t("form.lastNameExample")} value={form.lastName} onChange={handleChange} className={getInputClassName("lastName")} autoComplete="family-name" aria-required="true" aria-invalid={Boolean(fieldErrors.lastName)} />{renderFieldError("lastName")}</div>
        </div>
        <div className="rp-row">
          <div className="rp-field rp-field--sm"><label className="rp-label" htmlFor="rp-doc-type">{t("ui.tipo.doc") + " "}<span className="rp-required">*</span></label><select id="rp-doc-type" name="documentType" value={form.documentType} onChange={handleChange} className="rp-select" aria-required="true"><option value="CC">CC</option><option value="TI">TI</option><option value="CE">CE</option></select></div>
          <div className="rp-field"><label className="rp-label" htmlFor="rp-doc-number">{t("ui.cedula.de.ciudadania") + " "}<span className="rp-required">*</span></label><input id="rp-doc-number" name="documentNumber" inputMode="numeric" type="text" placeholder={t("form.idExample")} value={form.documentNumber} onChange={handleChange} className={getInputClassName("documentNumber")} aria-required="true" aria-invalid={Boolean(fieldErrors.documentNumber)} maxLength={10} />{renderFieldError("documentNumber")}</div>
        </div>
        <div className="rp-field"><label className="rp-label" htmlFor="rp-phone">{t("ui.telefono") + " "}<span className="rp-required">*</span></label><input id="rp-phone" name="phoneNumber" inputMode="numeric" type="tel" placeholder={t("form.phoneExample")} value={form.phoneNumber} onChange={handleChange} className={getInputClassName("phoneNumber")} autoComplete="tel" aria-required="true" aria-invalid={Boolean(fieldErrors.phoneNumber)} maxLength={10} />{renderFieldError("phoneNumber")}</div>
        <p className="rp-section-label">{t("ui.acceso")}</p>
        <div className="rp-field"><label className="rp-label" htmlFor="rp-email">{t("auth.email") + " "}<span className="rp-required">*</span></label><input id="rp-email" name="email" type="email" placeholder={t("form.emailExample")} value={form.email} onChange={handleChange} className={getInputClassName("email")} autoComplete="email" aria-required="true" aria-invalid={Boolean(fieldErrors.email)} />{renderFieldError("email")}</div>
        <div className="rp-row">
          <div className="rp-field"><label className="rp-label" htmlFor="rp-password">{t("auth.password") + " "}<span className="rp-required">*</span></label><input id="rp-password" name="password" type="password" placeholder={t("ui.min.8.caracteres")} value={form.password} onChange={handleChange} className={getInputClassName("password")} autoComplete="new-password" aria-required="true" aria-invalid={Boolean(fieldErrors.password)} />{renderFieldError("password")}</div>
          <div className="rp-field"><label className="rp-label" htmlFor="rp-confirm">{t("auth.confirmPassword") + " "}<span className="rp-required">*</span></label><input id="rp-confirm" name="confirmPassword" type="password" placeholder={t("ui.repite.la.contrasena")} value={confirmPassword} onChange={handleConfirmPasswordChange} className={getInputClassName("confirmPassword")} autoComplete="new-password" aria-required="true" aria-invalid={Boolean(fieldErrors.confirmPassword)} />{renderFieldError("confirmPassword")}</div>
        </div>
        <div className="rp-consents">
          <label className="rp-consent"><input type="checkbox" checked={acceptsDataPolicy} onChange={(event) => handleConsentChange("dataPolicy", event.target.checked)} /><span>{t("ui.acepto.el.tratamiento.de.mis.datos.personales.conforme.a.la") + " "}<button type="button" className="rp-legal-link" onClick={() => setLegalDocument("privacy")}>{t("ui.politica.de.privacidad")}</button>.</span></label>
          <label className="rp-consent"><input type="checkbox" checked={acceptsTerms} onChange={(event) => handleConsentChange("terms", event.target.checked)} /><span>{t("legal.acceptTermsPrefix") + " "}<button type="button" className="rp-legal-link" onClick={() => setLegalDocument("terms")}>{legalContent.terms.title.toLowerCase()}</button>.</span></label>
          {fieldErrors.consents && (!acceptsDataPolicy || !acceptsTerms) && <p className="rp-field-error">{localizeMessage(fieldErrors.consents, t)}</p>}
        </div>
        <button className="rp-btn" type="submit" disabled={!isFormValid} aria-busy={isLoading}>{isLoading && <svg className="rp-spinner" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeDashoffset="10" /></svg>}{isLoading ? t("auth.registering") : t("auth.registerAction")}</button>
      </form>
    </div>
    {legalDocument && <div className="rp-legal-overlay" onClick={() => setLegalDocument(null)}>
      <section className="rp-legal-dialog" role="dialog" aria-modal="true" aria-labelledby="rp-legal-title" onClick={(event) => event.stopPropagation()}>
        <h2 id="rp-legal-title">{legalContent[legalDocument].title}</h2>
        <p className="rp-legal-date">{t("legal.updated")}</p>
        <p>{legalContent[legalDocument].intro}</p>
        {legalContent[legalDocument].sections.map(([title, body]) => <div key={title}><h3>{title}</h3><p>{body}</p></div>)}
        <button type="button" className="rp-legal-close" onClick={() => setLegalDocument(null)}>{t("ui.cerrar")}</button>
      </section>
    </div>}
    </div>
  );
};
