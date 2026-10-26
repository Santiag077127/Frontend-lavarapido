import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { ThemeProvider } from "@/theme/theme";
import { ConfiguracionPage } from "./ConfiguracionPage";

describe("ConfiguracionPage", () => {
  it("keeps email change in settings and groups password actions in one responsive action area", () => {
    const { container } = render(<ThemeProvider><MemoryRouter><ConfiguracionPage /></MemoryRouter></ThemeProvider>);
    expect(screen.getByRole("link", { name: "Cambiar correo" })).toHaveAttribute("href", "/dashboard/cambiar-correo");
    const actions = container.querySelector(".config-card-actions");
    expect(actions).toHaveClass("config-card-actions");
    expect(actions?.querySelectorAll("a")).toHaveLength(2);
  });

  it("changes the accent immediately and persists the selected color", () => {
    render(<ThemeProvider><MemoryRouter><ConfiguracionPage /></MemoryRouter></ThemeProvider>);
    const emerald = screen.getByRole("button", { name: "Verde" });
    fireEvent.click(emerald);
    expect(emerald).toHaveAttribute("aria-pressed", "true");
    expect(document.documentElement.dataset.accent).toBe("emerald");
    expect(localStorage.getItem("lava-accent-color")).toBe("emerald");
  });
});
