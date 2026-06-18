// src/features/dashboard/components/ConfirmModal/index.tsx
//
// Modal genérico de confirmación. Reutilizable para cualquier acción
// destructiva futura (no solo cancelar turnos).

import "./ConfirmModal.css";

interface ConfirmModalProps {
  titulo: string;
  mensaje: string;
  textoConfirmar?: string;
  textoVolver?: string;
  onConfirmar: () => void;
  onCancelar: () => void;
}

export const ConfirmModal = ({
  titulo,
  mensaje,
  textoConfirmar = "Confirmar",
  textoVolver = "Cancelar",
  onConfirmar,
  onCancelar,
}: ConfirmModalProps) => {
  return (
    <div className="confirm-overlay" onClick={onCancelar}>
      <div className="confirm-card" onClick={(e) => e.stopPropagation()}>
        <h3 className="confirm-titulo">{titulo}</h3>
        <p className="confirm-mensaje">{mensaje}</p>
        <div className="confirm-acciones">
          <button className="confirm-btn-volver" onClick={onCancelar}>
            {textoVolver}
          </button>
          <button className="confirm-btn-confirmar" onClick={onConfirmar}>
            {textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
};
