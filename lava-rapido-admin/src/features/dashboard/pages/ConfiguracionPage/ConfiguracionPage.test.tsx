import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { ThemeProvider } from "@/theme/theme";
import { ChangeEmailPage } from "../ChangeEmailPage/ChangeEmailPage";
import { ConfiguracionPage } from "./ConfiguracionPage";

describe("ConfiguracionPage", () => {
  beforeEach(() => localStorage.clear());

  it("keeps email change in settings and groups password actions in one responsive action area", () => {
    const { container } = render(<ThemeProvider><MemoryRouter><ConfiguracionPage /></MemoryRouter></ThemeProvider>);
    expect(screen.getByRole("link", { name: "Cambiar correo" })).toHaveAttribute("href", "/dashboard/cambiar-correo");
    expect(screen.queryByText("Color de interfaz")).not.toBeInTheDocument();
    expect(container.querySelector(".config-accent-options")).toBeNull();
    const actions = container.querySelector(".config-card-actions");
    expect(actions).toHaveClass("config-card-actions");
    expect(actions?.querySelectorAll("a")).toHaveLength(2);
  });

  it("navigates from settings to the email change form", () => {
    render(<ThemeProvider><MemoryRouter initialEntries={["/dashboard/configuracion"]}><Routes>
      <Route path="/dashboard/configuracion" element={<ConfiguracionPage />} />
      <Route path="/dashboard/cambiar-correo" element={<ChangeEmailPage />} />
    </Routes></MemoryRouter></ThemeProvider>);

    fireEvent.click(screen.getByRole("link", { name: "Cambiar correo" }));
    expect(screen.getByLabelText("Nuevo correo electrónico")).toBeInTheDocument();
  });

  it("keeps light and dark mode controls available", () => {
    render(<ThemeProvider><MemoryRouter><ConfiguracionPage /></MemoryRouter></ThemeProvider>);
    const modeToggle = screen.getByRole("button", { name: "Modo claro" });
    fireEvent.click(modeToggle);
    expect(modeToggle).toHaveAttribute("aria-pressed", "true");
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(localStorage.getItem("lava-dark-mode")).toBe("true");
  });
});
