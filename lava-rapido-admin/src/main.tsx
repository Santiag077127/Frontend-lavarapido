import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AppRouter } from "./router/AppRouter";
import { ThemeProvider } from "./theme/theme";

// Estilos globales — siempre primero variables, luego global
import "./styles/variables.css";
import "./styles/global.css";

createRoot(
  document.getElementById("root")!
).render(
  <StrictMode>
    <ThemeProvider>
      <AppRouter />
    </ThemeProvider>
  </StrictMode>
);
