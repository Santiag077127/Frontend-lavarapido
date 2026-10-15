import { localizeMessage, useTranslations } from "@/theme/theme";
// Pide confirmación antes de ejecutar una acción sensible.
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
  textoConfirmar,
  textoVolver,
  onConfirmar,
  onCancelar,
}: ConfirmModalProps) => {
  const t = useTranslations();
  return (
    <div className="confirm-overlay" onClick={onCancelar}>
      <div className="confirm-card" onClick={(e) => e.stopPropagation()}>
        <h3 className="confirm-titulo">{titulo}</h3>
        <p className="confirm-mensaje">{localizeMessage(mensaje, t)}</p>
        <div className="confirm-acciones">
          <button className="confirm-btn-volver" onClick={onCancelar}>
            {textoVolver ?? t("common.cancel")}
          </button>
          <button className="confirm-btn-confirmar" onClick={onConfirmar}>
            {textoConfirmar ?? t("common.confirm")}
          </button>
        </div>
      </div>
    </div>
  );
};
