import "./LogoutModal.css";

interface Props {
  onConfirmar: () => void;
  onCancelar:  () => void;
}

export const LogoutModal = ({ onConfirmar, onCancelar }: Props) => {
  return (
    // Clic en el fondo oscuro cancela
    <div className="logout-overlay" onClick={onCancelar}>
      <div className="logout-card" onClick={(e) => e.stopPropagation()}>

        {/* Ícono visual */}
        <div className="logout-icon">🔒</div>

        {/* Mensaje profesional */}
        <h3 className="logout-title">¿Deseas cerrar sesión?</h3>
        <p className="logout-desc">
          Tu sesión actual finalizará. Deberás ingresar tus
          credenciales nuevamente para acceder al sistema.
        </p>

        {/* Acciones */}
        <div className="logout-actions">
          <button
            className="logout-btn-cancelar"
            onClick={onCancelar}
          >
            Cancelar
          </button>
          <button
            className="logout-btn-confirmar"
            onClick={onConfirmar}
          >
            Cerrar sesión
          </button>
        </div>

      </div>
    </div>
  );
};
