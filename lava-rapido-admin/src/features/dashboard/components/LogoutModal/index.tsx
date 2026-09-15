import "./LogoutModal.css";
import { useContext } from "react";
import { ThemeContext } from "@/theme/theme";

interface Props {
  onConfirmar: () => void;
  onCancelar:  () => void;
}

export const LogoutModal = ({ onConfirmar, onCancelar }: Props) => {
  const theme = useContext(ThemeContext);
  const t = theme?.t ?? ((key: string) => key);

  return (
    // Clic en el fondo oscuro cancela
    <div className="logout-overlay" onClick={onCancelar}>
      <div className="logout-card" onClick={(e) => e.stopPropagation()}>

        {/* Ícono visual */}
        <div className="logout-icon">🔒</div>

        {/* Mensaje profesional */}
        <h3 className="logout-title">{t("logout.confirmTitle")}</h3>
        <p className="logout-desc">
          {t("logout.confirmDesc")}
        </p>

        {/* Acciones */}
        <div className="logout-actions">
          <button
            className="logout-btn-cancelar"
            onClick={onCancelar}
          >
            {t("common.cancel")}
          </button>
          <button
            className="logout-btn-confirmar"
            onClick={onConfirmar}
          >
            {t("settings.logout.action")}
          </button>
        </div>

      </div>
    </div>
  );
};
