import "./Sidebar.css";

import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import { useAuthStore } from "../../../../store/authStore";
import { LogoutModal }  from "../LogoutModal";
import logo             from "../../../../assets/images/Logo.png";

export const Sidebar = () => {
  const logout   = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const [modalVisible, setModalVisible] = useState(false);

  const handleConfirmarLogout = () => {
    setModalVisible(false);
    logout();
    navigate("/", { replace: true });
  };

  return (
    <>
      <aside className="sidebar">

        <div className="sidebar-logo">
          <img src={logo} alt="Lava Rápido" />
        </div>

        <nav className="sidebar-nav">
          {/* ── nuevo ── */}
          <NavLink
            to="/dashboard/panel"
            className={({ isActive }) =>
              isActive ? "sidebar-link active" : "sidebar-link"
            }
          >
            Inicio
          </NavLink>

          <NavLink
            to="/dashboard/servicios"
            className={({ isActive }) =>
              isActive ? "sidebar-link active" : "sidebar-link"
            }
          >
            Servicios
          </NavLink>
        </nav>

        <button
          className="sidebar-logout"
          onClick={() => setModalVisible(true)}
        >
          Cerrar sesión
        </button>

      </aside>

      {modalVisible && (
        <LogoutModal
          onConfirmar={handleConfirmarLogout}
          onCancelar={() => setModalVisible(false)}
        />
      )}
    </>
  );
};