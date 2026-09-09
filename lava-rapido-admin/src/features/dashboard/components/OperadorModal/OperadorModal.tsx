import "./OperadorModal.css";
import { useState } from "react";

interface Props {
  onGuardar: (data: { email: string; documentNumber: string }) => Promise<void>;
  onCancelar: () => void;
}

export const OperadorModal = ({ onGuardar, onCancelar }: Props) => {
  const [email, setEmail] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const handleGuardar = async () => {
    if (!email.trim()) { setError("El correo es obligatorio."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError("Ingresa un correo electrónico válido."); return; }
    if (!documentNumber.trim()) { setError("El número de documento es obligatorio."); return; }
    setGuardando(true); setError("");
    try { await onGuardar({ email: email.trim(), documentNumber: documentNumber.trim() }); }
    catch (e) { setError(e instanceof Error ? e.message : "No se pudo asignar el operador."); }
    finally { setGuardando(false); }
  };
  return <div className="om-overlay"><div className="om-card">
    <h3 className="om-titulo">Nuevo operador</h3><p className="om-subtitulo">Asigna rol de operador a un usuario existente</p>
    {error && <div className="om-error"><span>⚠</span> {error}</div>}
    <div className="om-field"><label className="om-label">Correo electrónico *</label><input type="email" className="om-input" placeholder="ejemplo@correo.com" value={email} onChange={e => setEmail(e.target.value)} /></div>
    <div className="om-field"><label className="om-label">Número de documento *</label><input type="text" className="om-input" placeholder="Ej: 1234567890" value={documentNumber} onChange={e => setDocumentNumber(e.target.value)} /></div>
    <div className="om-actions"><button className="om-btn-cancelar" onClick={onCancelar} disabled={guardando}>Cancelar</button><button className="om-btn-guardar" onClick={handleGuardar} disabled={guardando}>{guardando ? "Asignando..." : "Asignar operador"}</button></div>
  </div></div>;
};
