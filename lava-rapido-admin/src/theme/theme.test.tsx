import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Link, Route, Routes } from "react-router-dom";
import { ThemeContext, ThemeProvider, formatTranslation, getMissingTranslationKeys, localizeMessage, type LanguageOption } from "./theme";
import { useContext, useState } from "react";

function TestApp() {
  const theme = useContext(ThemeContext)!;
  const [validation] = useState("ui.ingresa.un.correo.electronico.valido");
  return <>
    <select aria-label="language" value={theme.language} onChange={(e) => theme.setLanguage(e.target.value as LanguageOption)}>
      <option value="es">es</option><option value="en">en</option><option value="fr">fr</option><option value="pt">pt</option>
    </select>
    <Routes>
      <Route path="/" element={<><h1>{theme.t("landing.title")}</h1><p role="alert">{localizeMessage(validation, theme.t)}</p><Link to="/next">Next</Link></>} />
      <Route path="/next" element={<h1>{theme.t("settings.title")}</h1>} />
    </Routes>
  </>;
}

afterEach(() => cleanup());

describe("admin translations", () => {
  it("updates copy and validation immediately, retains the selection while navigating and after remount", () => {
    const view = render(<ThemeProvider><MemoryRouter><TestApp /></MemoryRouter></ThemeProvider>);
    expect(screen.getByRole("alert").textContent).toBe("Ingresa un correo electrónico válido.");
    fireEvent.change(screen.getByLabelText("language"), { target: { value: "en" } });
    expect(screen.getByRole("alert").textContent).toBe("Enter a valid email address.");
    expect(screen.getByRole("heading").textContent).toBe("Manage your car wash from one place");
    expect(document.documentElement.lang).toBe("en");
    expect(document.title).toBe("Lava Rápido — Admin");
    fireEvent.click(screen.getByText("Next"));
    expect(screen.getByRole("heading").textContent).toBe("Settings");
    expect(localStorage.getItem("lava-language")).toBe("en");
    view.unmount();
    render(<ThemeProvider><MemoryRouter><TestApp /></MemoryRouter></ThemeProvider>);
    expect((screen.getByLabelText("language") as HTMLSelectElement).value).toBe("en");
    for (const [language, message] of [["fr", "Saisissez une adresse courriel valide."], ["pt", "Digite um e-mail válido."]] as const) {
      fireEvent.change(screen.getByLabelText("language"), { target: { value: language } });
      expect(screen.getByRole("alert").textContent).toBe(message);
    }
  });

  it("uses Spanish fallback and records a missing key once", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    function Missing() { const t = useContext(ThemeContext)!.t; return <p>{t("missing.example")}{t("missing.example")}</p>; }
    render(<ThemeProvider><Missing /></ThemeProvider>);
    expect(screen.getByText("missing.examplemissing.example")).toBeTruthy();
    expect(getMissingTranslationKeys()).toContain("es:missing.example");
    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
    expect(formatTranslation("Hello {name}", { name: "Ada" })).toBe("Hello Ada");
  });
});
