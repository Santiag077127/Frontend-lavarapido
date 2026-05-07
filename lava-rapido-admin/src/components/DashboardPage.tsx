import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";

export const DashboardPage = () => {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      {/* Outlet renderiza ServiciosPage u otras páginas según la ruta activa */}
      <main className="dashboard-content">
        <Outlet />
      </main>
    </div>
  );
};