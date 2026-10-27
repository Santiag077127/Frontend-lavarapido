import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import LandingPage from "./Landing";

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
});
