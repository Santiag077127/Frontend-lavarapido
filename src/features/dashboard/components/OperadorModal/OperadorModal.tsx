import "./OperadorModal.css";
import { useState } from "react";

interface Props {
  onGuardar:  (data: { nombre: string; correo: string; telefono: string }) => void;
  onCancelar: () => void;
}

export const OperadorModal = ({ onGuardar, onCancelar }: Props) => {
  const [nombre,   setNombre]   = useState("");
  const [correo,   setCorreo]   = useState("");
  const [telefono, setTelefono] = useState("");
  const [error,    setError]    = useState("");

  const handleGuardar = () => {
    if (!nombre.trim())   { setError("El nombre es obligatorio.");   return; }
    if (!correo.trim())   { setError("El correo es obligatorio.");   return; }
    if (!telefono.trim()) { setError("El teléfono es obligatorio."); return; }

    const phoneRegex = /^3[0-9]{9}$/;
    if (!phoneRegex.test(telefono)) {
      setError("El teléfono debe empezar por 3 y tener 10 dígitos.");
      return;
    }

    onGuardar({ nombre, correo, telefono });
  };

  return (
    <div className="om-overlay">
      <div className="om-card">

        <h3 className="om-titulo">Nuevo operador</h3>
        <p className="om-subtitulo">Asigna rol de operador a un usuario existente</p>

        {error && (
          <div className="om-error">
            <span>⚠</span> {error}
          </div>
        )}

        <div className="om-field">
          <label className="om-label">Nombre completo *</label>
          <input
            type="text"
            className="om-input"
            placeholder="Ej: Carlos Rojas"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
          />
        </div>

        <div className="om-field">
          <label className="om-label">Correo electrónico *</label>
          <input
            type="email"
            className="om-input"
            placeholder="ejemplo@correo.com"
            value={correo}
            onChange={e => setCorreo(e.target.value)}
          />
        </div>

        <div className="om-field">
          <label className="om-label">Teléfono *</label>
          <input
            type="tel"
            className="om-input"
            placeholder="Ej: 3101234567"
            value={telefono}
            onChange={e => setTelefono(e.target.value)}
            maxLength={10}
          />
        </div>

        <div className="om-actions">
          <button className="om-btn-cancelar" onClick={onCancelar}>
            Cancelar
          </button>
          <button className="om-btn-guardar" onClick={handleGuardar}>
            Asignar operador
          </button>
        </div>

      </div>
    </div>
  );
};