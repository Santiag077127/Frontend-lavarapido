import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import LandingPage from "./Landing";
import { ThemeProvider, translations } from "../../../../theme/theme";

describe("LandingPage Android download", () => {
  it("shows the Android download action with the official APK URL", () => {
    render(<MemoryRouter><LandingPage /></MemoryRouter>);

    const downloadLink = screen.getByRole("link", { name: "Descargar app para Android" });
    expect(downloadLink).toHaveAttribute(
      "href",
      "https://expo.dev/artifacts/eas/kuA0DnLqABvS9iDJgxupUqvjiwnEJnt4OnR22NoIF9c.apk",
    );
    expect(downloadLink).toHaveAttribute("download");
    expect(screen.getByText("Aplicación disponible para dispositivos Android · APK · versión 1.0.0.")).toBeInTheDocument();
  });

  it("removes the three obsolete section links and keeps primary navigation", () => {
    render(<MemoryRouter><LandingPage /></MemoryRouter>);
    const navigation = screen.getByRole("navigation");
    expect(navigation.querySelector('a[href="#funciones"]')).toBeNull();
    expect(navigation.querySelector('a[href="#operacion"]')).toBeNull();
    expect(navigation.querySelector('a[href="#seguridad"]')).toBeNull();
    expect(screen.getByRole("button", { name: "Registrar usuario" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Acceso administrativo" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Restablecer contraseña" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Una operación más clara para cada servicio" })).toBeInTheDocument();
  });

  it("uses the shared primary action style and keeps recovery navigation", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/forgot-password" element={<h1>Recovery screen</h1>} />
        </Routes>
      </MemoryRouter>,
    );

    const registerButton = screen.getByRole("button", { name: "Registrar usuario" });
    const recoveryButton = screen.getByRole("button", { name: "Restablecer contraseña" });
    const downloadLink = screen.getByRole("link", { name: "Descargar app para Android" });
    expect(recoveryButton).toHaveClass("hero-primary");
    expect(recoveryButton).toHaveClass(registerButton.className);
    expect(recoveryButton).toHaveClass(downloadLink.className.split(" ")[0]);

    fireEvent.click(recoveryButton);
    expect(await screen.findByRole("heading", { name: "Recovery screen" })).toBeInTheDocument();
  });

  it("keeps feature copy translated for every supported language", () => {
    for (const language of ["es", "en", "fr", "pt"] as const) {
      expect(translations[language]["landing.feature.services.title"]).toBeTruthy();
      expect(translations[language]["landing.feature.services.desc"]).toBeTruthy();
      expect(translations[language]["landing.downloadAndroid"]).toBeTruthy();
      expect(translations[language]["landing.resetPassword"]).toBeTruthy();
    }
  });

  it("keeps the landing page mode switch connected to the shared theme", async () => {
    localStorage.removeItem("lava-dark-mode");
    render(<ThemeProvider><MemoryRouter><LandingPage /></MemoryRouter></ThemeProvider>);
    await waitFor(() => expect(document.documentElement.dataset.theme).toBe("light"));
    const recoveryButton = screen.getByRole("button", { name: "Restablecer contraseña" });
    expect(recoveryButton).toHaveClass("hero-primary");
    fireEvent.click(screen.getByRole("button", { name: "Cambiar modo de color" }));
    await waitFor(() => expect(document.documentElement.dataset.theme).toBe("dark"));
    expect(recoveryButton).toHaveClass("hero-primary");
    document.documentElement.dataset.theme = "light";
    localStorage.removeItem("lava-dark-mode");
  });
});
