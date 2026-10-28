import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { PasswordVisibilityField } from "./PasswordVisibilityField";

describe("PasswordVisibilityField", () => {
  it("matches the closed eye icon and accessible action with the initially hidden input", () => {
    render(<PasswordVisibilityField id="password" label="Contraseña" value="secret" onChange={() => {}} autoComplete="current-password" />);
    const input = screen.getByLabelText("Contraseña");
    const button = screen.getByRole("button", { name: "Mostrar contraseña" });

    expect(input).toHaveAttribute("type", "password");
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveAttribute("aria-controls", "password");
    expect(button.querySelector("svg")?.getAttribute("class")).toContain("lucide-eye-off");
  });

  it("toggles icon, input visibility, value, focus, and accessible action together", async () => {
    const user = userEvent.setup();
    render(<PasswordVisibilityField id="password" label="Contraseña" value="secret" onChange={() => {}} autoComplete="current-password" />);
    const input = screen.getByLabelText("Contraseña");
    const showButton = screen.getByRole("button", { name: "Mostrar contraseña" });

    await user.click(showButton);
    const hideButton = screen.getByRole("button", { name: "Ocultar contraseña" });
    expect(input).toHaveAttribute("type", "text");
    expect(input).toHaveValue("secret");
    expect(document.activeElement).toBe(hideButton);
    expect(hideButton.querySelector("svg")?.getAttribute("class")).toContain("lucide-eye");
    expect(hideButton.querySelector("svg")?.getAttribute("class")).not.toContain("lucide-eye-off");

    await user.click(hideButton);
    const showAgain = screen.getByRole("button", { name: "Mostrar contraseña" });
    expect(input).toHaveAttribute("type", "password");
    expect(input).toHaveValue("secret");
    expect(showAgain.querySelector("svg")?.getAttribute("class")).toContain("lucide-eye-off");
  });

  it("keeps visibility state independent across password fields", async () => {
    const user = userEvent.setup();
    render(<>
      <PasswordVisibilityField id="current" label="Contraseña actual" value="current" onChange={() => {}} autoComplete="current-password" />
      <PasswordVisibilityField id="next" label="Nueva contraseña" value="next" onChange={() => {}} autoComplete="new-password" />
    </>);
    await user.click(screen.getAllByRole("button", { name: "Mostrar contraseña" })[0]);
    expect(screen.getByLabelText("Contraseña actual")).toHaveAttribute("type", "text");
    expect(screen.getByLabelText("Nueva contraseña")).toHaveAttribute("type", "password");
  });

  it("can be toggled with the keyboard", async () => {
    const user = userEvent.setup();
    render(<PasswordVisibilityField id="password" label="Contraseña" value="secret" onChange={() => {}} autoComplete="current-password" />);
    await user.tab();
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Mostrar contraseña" }));
    await user.keyboard("{Enter}");
    expect(screen.getByLabelText("Contraseña")).toHaveAttribute("type", "text");
  });
});
