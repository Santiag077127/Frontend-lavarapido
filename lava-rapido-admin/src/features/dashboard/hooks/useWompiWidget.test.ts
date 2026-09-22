import { afterEach, describe, expect, it, vi } from "vitest";
import { cargarWompiWidget, crearConfiguracionWidget, WOMPI_SCRIPT_URL } from "./useWompiWidget";

describe("integración del Widget Wompi", () => {
  afterEach(() => {
    delete window.WidgetCheckout;
    document.querySelectorAll(`script[src="${WOMPI_SCRIPT_URL}"]`).forEach((script) => script.remove());
    vi.restoreAllMocks();
  });

  it("usa solo los datos firmados por backend y no fuerza NEQUI ni otro método", () => {
    const config = crearConfiguracionWidget({ moneda: "COP", montoEnCentavos: 3500000, referencia: "PAGO-1", publicKey: "pub_test", firmaIntegridad: "hash", redirectUrl: "https://app.test/pagos/resultado" });
    expect(config).toEqual({ currency: "COP", amountInCents: 3500000, reference: "PAGO-1", publicKey: "pub_test", signature: { integrity: "hash" }, redirectUrl: "https://app.test/pagos/resultado" });
    expect(config).not.toHaveProperty("paymentMethod");
  });

  it("comparte una sola carga del script", async () => {
    const primera = cargarWompiWidget();
    const segunda = cargarWompiWidget();
    expect(document.querySelectorAll(`script[src="${WOMPI_SCRIPT_URL}"]`)).toHaveLength(1);
    window.WidgetCheckout = class { open() {} } as typeof window.WidgetCheckout;
    document.getElementById("wompi-widget-script")?.dispatchEvent(new Event("load"));
    await expect(Promise.all([primera, segunda])).resolves.toEqual([undefined, undefined]);
  });
});
