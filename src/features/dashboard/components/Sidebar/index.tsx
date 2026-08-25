import "./Sidebar.css";

import { useEffect, useState } from "react";
import {
  Car,
  ChevronLeft,
  ChevronRight,
  Clock,
  Home,
  LogOut,
  Map,
  Tag,
  Users,
  UserRound,
  Wrench,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

import { useAuthStore } from "../../../../store/authStore";
import { LogoutModal } from "../LogoutModal";
import logo from "../../../../assets/images/Logo.png";

export const Sidebar = () => {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const [modalVisible, setModalVisible] = useState(false);
  const [colapsado, setColapsado] = useState<boolean>(() => {
    return localStorage.getItem("sidebar-colapsado") === "true";
  });

  useEffect(() => {
    localStorage.setItem("sidebar-colapsado", String(colapsado));
  }, [colapsado]);

  const handleConfirmarLogout = () => {
    setModalVisible(false);
    logout();
    navigate("/", { replace: true });
  };

  return (
    <>
      <aside className={`sidebar ${colapsado ? "sidebar--colapsado" : ""}`}>
        <div className="sidebar-inner">
          <button
            className="sidebar-collapse"
            type="button"
            onClick={() => setColapsado(!colapsado)}
            aria-label={colapsado ? "Expandir menú lateral" : "Colapsar menú lateral"}
            title={colapsado ? "Expandir menú lateral" : "Colapsar menú lateral"}
          >
            {colapsado ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>

          <div className="sidebar-logo">
            <img src={logo} alt="Lava Rápido" />
          </div>

          <nav className="sidebar-nav">
            <NavLink to="/dashboard/panel" className={({ isActive }) => isActive ? "sidebar-link sidebar-link--active" : "sidebar-link"}>
              <Home size={18} aria-hidden="true" />
              <span>Inicio</span>
            </NavLink>
            <NavLink to="/dashboard/servicios" className={({ isActive }) => isActive ? "sidebar-link sidebar-link--active" : "sidebar-link"}>
              <Wrench size={18} aria-hidden="true" />
              <span>Servicios</span>
            </NavLink>
            <NavLink to="/dashboard/vehiculos" className={({ isActive }) => isActive ? "sidebar-link sidebar-link--active" : "sidebar-link"}>
              <Car size={18} aria-hidden="true" />
              <span>Vehículos</span>
            </NavLink>
            <NavLink to="/dashboard/marcas" className={({ isActive }) => isActive ? "sidebar-link sidebar-link--active" : "sidebar-link"}>
              <Tag size={18} aria-hidden="true" />
              <span>Marcas</span>
            </NavLink>
            <NavLink to="/dashboard/maps" className={({ isActive }) => isActive ? "sidebar-link sidebar-link--active" : "sidebar-link"}>
              <Map size={18} aria-hidden="true" />
              <span>Mapa</span>
            </NavLink>
            <NavLink to="/dashboard/operadores" className={({ isActive }) => isActive ? "sidebar-link sidebar-link--active" : "sidebar-link"}>
              <Users size={18} aria-hidden="true" />
              <span>Operadores</span>
            </NavLink>
            <NavLink to="/dashboard/turnos" className={({ isActive }) => isActive ? "sidebar-link sidebar-link--active" : "sidebar-link"}>
              <Clock size={18} aria-hidden="true" />
              <span>Turnos</span>
            </NavLink>
            <NavLink to="/dashboard/perfil" className={({ isActive }) => isActive ? "sidebar-link sidebar-link--active" : "sidebar-link"}>
              <UserRound size={18} aria-hidden="true" />
              <span>Mi perfil</span>
            </NavLink>
          </nav>

          <button className="sidebar-logout" onClick={() => setModalVisible(true)}>
            <LogOut size={18} aria-hidden="true" />
            <span>Cerrar sesión</span>
          </button>
        </div>
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
