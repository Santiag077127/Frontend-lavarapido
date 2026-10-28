// Inicia React, aplica los estilos globales y monta el tema y las rutas.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AppRouter } from "./router/AppRouter";
import { ThemeProvider } from "./theme/theme";

// Estilos globales — siempre primero variables, luego global
import "./styles/variables.css";
import "./styles/global.css";
import "./styles/dark-mode.css";

createRoot(
  document.getElementById("root")!
).render(
  <StrictMode>
    <ThemeProvider>
      <AppRouter />
    </ThemeProvider>
  </StrictMode>
);
