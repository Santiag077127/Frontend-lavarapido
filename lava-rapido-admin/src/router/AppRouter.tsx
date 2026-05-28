import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoginPage } from "../features/auth/pages/LoginPage/LoginPage";
import { DashboardPage } from "../features/dashboard/pages/DashboardPage";
import { ServiciosPage } from "../features/dashboard/pages/ServiciosPage";
import LandingPage from "../features/auth/pages/LandingPage/Landing";

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />        {/* ← Landing */}
        <Route path="/login" element={<LoginPage />} />     {/* ← Login */}

        <Route path="/dashboard" element={<DashboardPage />}>
          <Route path="servicios" element={<ServiciosPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};