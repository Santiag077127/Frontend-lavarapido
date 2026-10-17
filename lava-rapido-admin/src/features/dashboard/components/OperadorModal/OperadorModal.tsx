// Recoge correo y documento para crear un operador.
import "./OperadorModal.css";
import { useContext, useState } from "react";
import { ThemeContext, localizeMessage, useTranslations } from "@/theme/theme";
import { UserRoundPlus } from "lucide-react";

interface Props {
  onGuardar: (data: { email: string; documentNumber: string }) => Promise<void>;
  onCancelar: () => void;
}

export const OperadorModal = ({ onGuardar, onCancelar }: Props) => {
  const theme = useContext(ThemeContext);
  const t = useTranslations();
  const [email, setEmail] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; documentNumber?: string }>({});
  const [guardando, setGuardando] = useState(false);
  const handleGuardar = async () => {
    const errors = {
      email: !email.trim()
        ? "ui.el.correo.es.obligatorio"
        : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
          ? "ui.ingresa.un.correo.electronico.valido"
          : "",
      documentNumber: !documentNumber.trim()
        ? "ui.el.numero.de.documento.es.obligatorio"
        : documentNumber.length < 6 || documentNumber.length > 10
          ? "ui.el.documento.debe.tener.entre.6.y.10.digitos"
          : "",
    };
    setFieldErrors(errors);
    if (errors.email || errors.documentNumber) return;
    setGuardando(true); setError("");
    try { await onGuardar({ email: email.trim(), documentNumber: documentNumber.trim() }); }
    catch (e) { setError(e instanceof Error ? e.message : "ui.no.se.pudo.asignar.el.operador"); }
    finally { setGuardando(false); }
  };
  return <div className="om-overlay"><div className="om-card" role="dialog" aria-modal="true" aria-labelledby="om-title">
    <div className="om-header"><span className="om-icon"><UserRoundPlus size={23} /></span><div><h3 id="om-title" className="om-titulo">{t("operators.new")}</h3><p className="om-subtitulo">{t("operators.modalSubtitle")}</p></div></div>
    <p className="om-help">{t("operators.newHint")}</p>
    {error && <div className="om-error"><span>⚠</span> {localizeMessage(error, t)}</div>}
    <div className="om-field"><label className="om-label" htmlFor="om-email">{t("auth.email")} *</label><input id="om-email" type="email" autoComplete="email" className={`om-input ${fieldErrors.email ? "om-input--error" : ""}`} placeholder={t("form.emailExample")} value={email} onChange={e => { setEmail(e.target.value); setFieldErrors(current => ({ ...current, email: "" })); }} />{fieldErrors.email && <p className="om-field-error">{localizeMessage(fieldErrors.email, t)}</p>}</div>
    <div className="om-field"><label className="om-label" htmlFor="om-document">{t("ui.numero.de.documento")} *</label><input id="om-document" type="text" inputMode="numeric" className={`om-input ${fieldErrors.documentNumber ? "om-input--error" : ""}`} placeholder={t("form.operatorIdExample")} value={documentNumber} onChange={e => { const next = e.target.value.replace(/\D/g, ""); setDocumentNumber(next); setFieldErrors(current => ({ ...current, documentNumber: next === e.target.value ? "" : "ui.el.documento.solo.puede.contener.numeros" })); }} maxLength={10} />{fieldErrors.documentNumber && <p className="om-field-error">{localizeMessage(fieldErrors.documentNumber, t)}</p>}</div>
    <div className="om-actions"><button className="om-btn-cancelar" onClick={onCancelar} disabled={guardando}>{t("common.cancel")}</button><button className="om-btn-guardar" onClick={handleGuardar} disabled={guardando}>{guardando ? t("operators.assigning") : t("operators.assign")}</button></div>
  </div></div>;
};
