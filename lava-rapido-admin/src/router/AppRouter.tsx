import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage }          from "../features/auth/pages/LoginPage/LoginPage";
import { RegisterPage }       from "../features/auth/pages/RegisterPage/RegisterPage"; // ← nuevo
import { DashboardPage }      from "../features/dashboard/pages/DashboardPage";
import { ServiciosPage }      from "../features/dashboard/pages/ServiciosPage";
import { PanelPrincipalPage } from "../features/dashboard/pages/PanelPrincipalPage";
import LandingPage            from "../features/auth/pages/LandingPage/Landing";
import { MapsPage } from "@/features/dashboard/pages/MapsPage/MapsPage";
import { OperadoresPage } from "@/features/dashboard/pages/OperadoresPage/OperadoresPage";
import { TurnosPage } from "@/features/dashboard/pages/TurnosPage/TurnosPage"; // ← nuevo

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"         element={<LandingPage />} />
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />  {/* ← nuevo */}

        <Route path="/dashboard" element={<DashboardPage />}>
          <Route index          element={<Navigate to="panel" replace />} />
          <Route path="panel"     element={<PanelPrincipalPage />} />
          <Route path="servicios" element={<ServiciosPage />} />
          <Route path="turnos" element={<TurnosPage />} /> {/* ← nuevo */}
          <Route path="maps" element={<MapsPage />} />
          <Route path="operadores" element={<OperadoresPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
