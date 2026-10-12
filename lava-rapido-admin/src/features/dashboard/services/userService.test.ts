import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ put: vi.fn() }));
vi.mock("@/services/api", () => ({ api: { put: mocks.put } }));

import { changePassword } from "./userService";

describe("changePassword", () => {
  beforeEach(() => mocks.put.mockReset());

  it("uses the API base URL without duplicating its /api prefix", async () => {
    mocks.put.mockResolvedValue({ data: undefined });

    await changePassword({ currentPassword: "CurrentPass1", newPassword: "NuevaPass1" });

    expect(mocks.put).toHaveBeenCalledWith("/users/password", {
      currentPassword: "CurrentPass1", newPassword: "NuevaPass1",
    });
  });
});
