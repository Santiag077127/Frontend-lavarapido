// Limpia la interfaz y el almacenamiento después de cada prueba.
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
  sessionStorage.clear();
  localStorage.clear();
});
