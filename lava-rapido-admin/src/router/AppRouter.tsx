import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoginPage } from "../features/auth/pages/LoginPage/LoginPage";
import { DashboardPage } from "../features/dashboard/pages/DashboardPage";
import { ServiciosPage } from "../features/dashboard/pages/ServiciosPage";

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />

        {/* Dashboard como layout — Outlet renderiza las rutas hijas */}
        <Route path="/dashboard" element={<DashboardPage />}>
          <Route path="servicios" element={<ServiciosPage />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
};