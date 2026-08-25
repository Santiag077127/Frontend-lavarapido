import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AppRouter } from "./router/AppRouter";

// Estilos globales — siempre primero variables, luego global
import "./styles/variables.css";
import "./styles/global.css";

createRoot(
  document.getElementById("root")!
).render(
  <StrictMode>
    <AppRouter />
  </StrictMode>
);