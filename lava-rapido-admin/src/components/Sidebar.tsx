import { NavLink } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import logo from "../assets/images/Logo.png";

export const Sidebar = () => {
  const logout = useAuthStore((state) => state.logout);

  return (
    <aside className="sidebar">

      <div className="sidebar-logo">
        <img src={logo} alt="Lava Rápido" />
      </div>

      <nav className="sidebar-nav">
        <NavLink
          to="/dashboard/servicios"
          className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}
        >
          🧼 Servicios
        </NavLink>
      </nav>

      <button className="sidebar-logout" onClick={logout}>
        Cerrar sesión
      </button>

    </aside>
  );
};