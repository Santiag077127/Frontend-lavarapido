import "./Sidebar.css";

import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import { useAuthStore } from "../../../../store/authStore";
import { LogoutModal }  from "../LogoutModal";
import logo from "../../../../assets/images/Logo.png";

export const Sidebar = () => {
  const logout   = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  // Controla si el modal de confirmación está visible
  const [modalVisible, setModalVisible] = useState(false);

  const handleConfirmarLogout = () => {
    setModalVisible(false);
    logout();                          // Limpia token y usuario
    navigate("/", { replace: true }); // Redirige al login
  };

  return (
    <>
      <aside className="sidebar">

        <div className="sidebar-logo">
          <img src={logo} alt="Lava Rápido" />
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/dashboard/servicios"
            className={({ isActive }) =>
              isActive ? "sidebar-link active" : "sidebar-link"
            }
          >
            Servicios
          </NavLink>
        </nav>

        {/* Abre el modal en vez de cerrar sesión directamente */}
        <button
          className="sidebar-logout"
          onClick={() => setModalVisible(true)}
        >
          Cerrar sesión
        </button>

      </aside>

      {/* Modal solo existe en el DOM cuando está visible */}
      {modalVisible && (
        <LogoutModal
          onConfirmar={handleConfirmarLogout}
          onCancelar={() => setModalVisible(false)}
        />
      )}
    </>
  );
};
