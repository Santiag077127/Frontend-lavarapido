import { expect, it, vi } from "vitest";
import { api } from "./api";
import { useAuthStore } from "@/store/authStore";

it("sends the JWT for the protected password-change endpoint", async () => {
  useAuthStore.getState().setAuth("test-token", {
    userId: "1", firstName: "A", email: "a@example.test", role: "ADMIN",
  });
  let authorization: string | undefined;

  await api.put("/users/password", { currentPassword: "CurrentPass1", newPassword: "NuevaPass1" }, {
    adapter: async (config) => {
      authorization = config.headers?.Authorization as string | undefined;
      return { data: undefined, status: 204, statusText: "No Content", headers: {}, config };
    },
  });

  expect(authorization).toBe("Bearer test-token");
});

it("expires the local session when password change receives 401", async () => {
  useAuthStore.getState().setAuth("test-token", {
    userId: "1", firstName: "A", email: "a@example.test", role: "ADMIN",
  });
  const listener = vi.fn();
  window.addEventListener("api:unauthorized", listener);

  await expect(api.put("/users/password", {}, {
    adapter: async (config) => { throw { response: { status: 401 }, config }; },
  })).rejects.toBeDefined();

  expect(useAuthStore.getState().token).toBeNull();
  expect(listener).toHaveBeenCalledOnce();
  window.removeEventListener("api:unauthorized", listener);
});
