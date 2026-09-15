import "./OperadorModal.css";
import { useContext, useState } from "react";
import { ThemeContext } from "@/theme/theme";

interface Props {
  onGuardar: (data: { email: string; documentNumber: string }) => Promise<void>;
  onCancelar: () => void;
}

export const OperadorModal = ({ onGuardar, onCancelar }: Props) => {
  const theme = useContext(ThemeContext);
  const t = theme?.t ?? ((key: string) => key);
  const [email, setEmail] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; documentNumber?: string }>({});
  const [guardando, setGuardando] = useState(false);
  const handleGuardar = async () => {
    const errors = {
      email: !email.trim()
        ? "El correo es obligatorio."
        : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
          ? "Ingresa un correo electrónico válido."
          : "",
      documentNumber: !documentNumber.trim()
        ? "El número de documento es obligatorio."
        : documentNumber.length < 6 || documentNumber.length > 10
          ? "El documento debe tener entre 6 y 10 dígitos."
          : "",
    };
    setFieldErrors(errors);
    if (errors.email || errors.documentNumber) return;
    setGuardando(true); setError("");
    try { await onGuardar({ email: email.trim(), documentNumber: documentNumber.trim() }); }
    catch (e) { setError(e instanceof Error ? e.message : "No se pudo asignar el operador."); }
    finally { setGuardando(false); }
  };
  return <div className="om-overlay"><div className="om-card">
    <h3 className="om-titulo">{t("operators.new")}</h3><p className="om-subtitulo">{t("operators.modalSubtitle")}</p>
    {error && <div className="om-error"><span>⚠</span> {error}</div>}
    <div className="om-field"><label className="om-label">{t("auth.email")} *</label><input type="email" className={`om-input ${fieldErrors.email ? "om-input--error" : ""}`} placeholder="ejemplo@correo.com" value={email} onChange={e => { setEmail(e.target.value); setFieldErrors(current => ({ ...current, email: "" })); }} />{fieldErrors.email && <p className="om-field-error">{fieldErrors.email}</p>}</div>
    <div className="om-field"><label className="om-label">Número de documento *</label><input type="text" inputMode="numeric" className={`om-input ${fieldErrors.documentNumber ? "om-input--error" : ""}`} placeholder="Ej: 1234567890" value={documentNumber} onChange={e => { const next = e.target.value.replace(/\D/g, ""); setDocumentNumber(next); setFieldErrors(current => ({ ...current, documentNumber: next === e.target.value ? "" : "El documento solo puede contener números." })); }} maxLength={10} />{fieldErrors.documentNumber && <p className="om-field-error">{fieldErrors.documentNumber}</p>}</div>
    <div className="om-actions"><button className="om-btn-cancelar" onClick={onCancelar} disabled={guardando}>{t("common.cancel")}</button><button className="om-btn-guardar" onClick={handleGuardar} disabled={guardando}>{guardando ? t("operators.assigning") : t("operators.assign")}</button></div>
  </div></div>;
};
