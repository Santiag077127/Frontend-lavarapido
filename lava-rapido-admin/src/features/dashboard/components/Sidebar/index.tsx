import "./Sidebar.css";

import { useContext, useEffect, useState } from "react";
import {
  Car,
  ChevronLeft,
  ChevronRight,
  Clock,
  Home,
  Map,
  Settings,
  Tag,
  Users,
  Wrench,
} from "lucide-react";
import { NavLink } from "react-router-dom";

import { ThemeContext } from "../../../../theme/theme";
import logo from "../../../../assets/images/Logo.png";

export const Sidebar = () => {
  const theme = useContext(ThemeContext);
  const t = theme?.t ?? ((key: string) => key);
  const [colapsado, setColapsado] = useState<boolean>(() => {
    return localStorage.getItem("sidebar-colapsado") === "true";
  });

  useEffect(() => {
    localStorage.setItem("sidebar-colapsado", String(colapsado));
  }, [colapsado]);

  return (
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
            <span>{t("nav.home")}</span>
          </NavLink>
          <NavLink to="/dashboard/servicios" className={({ isActive }) => isActive ? "sidebar-link sidebar-link--active" : "sidebar-link"}>
            <Wrench size={18} aria-hidden="true" />
            <span>{t("nav.services")}</span>
          </NavLink>
          <NavLink to="/dashboard/vehiculos" className={({ isActive }) => isActive ? "sidebar-link sidebar-link--active" : "sidebar-link"}>
            <Car size={18} aria-hidden="true" />
            <span>{t("nav.vehicles")}</span>
          </NavLink>
          <NavLink to="/dashboard/marcas" className={({ isActive }) => isActive ? "sidebar-link sidebar-link--active" : "sidebar-link"}>
            <Tag size={18} aria-hidden="true" />
            <span>{t("nav.brands")}</span>
          </NavLink>
          <NavLink to="/dashboard/maps" className={({ isActive }) => isActive ? "sidebar-link sidebar-link--active" : "sidebar-link"}>
            <Map size={18} aria-hidden="true" />
            <span>{t("nav.map")}</span>
          </NavLink>
          <NavLink to="/dashboard/operadores" className={({ isActive }) => isActive ? "sidebar-link sidebar-link--active" : "sidebar-link"}>
            <Users size={18} aria-hidden="true" />
            <span>{t("nav.operators")}</span>
          </NavLink>
          <NavLink to="/dashboard/turnos" className={({ isActive }) => isActive ? "sidebar-link sidebar-link--active" : "sidebar-link"}>
            <Clock size={18} aria-hidden="true" />
            <span>{t("nav.turns")}</span>
          </NavLink>
        </nav>

        <NavLink to="/dashboard/configuracion" className={({ isActive }) => isActive ? "sidebar-link sidebar-settings sidebar-link--active" : "sidebar-link sidebar-settings"}>
          <Settings size={18} aria-hidden="true" />
          <span>{t("nav.settings")}</span>
        </NavLink>
      </div>
    </aside>
  );
};
