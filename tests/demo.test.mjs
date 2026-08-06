import assert from "node:assert/strict";
import test from "node:test";

test("GitHub Pages demo mode provides sample data and browser CRUD", async () => {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
  };
  globalThis.window = {
    location: { protocol: "https:", hostname: "shawn-cse.github.io", search: "" },
  };

  const moduleUrl = new URL(`../client/src/api.js?test=${Date.now()}`, import.meta.url);
  const { apiRequest, isDemoMode } = await import(moduleUrl.href);
  assert.equal(isDemoMode(), true);

  const session = await apiRequest("/api/auth/session");
  assert.equal(session.user.role, "admin");
  assert.equal(session.data.vehicles.length, 3);

  const created = await apiRequest("/api/vehicles", {
    method: "POST",
    body: JSON.stringify({ name: "Demo Test Car", type: "Car", plate: "DEMO-TEST-01" }),
  });
  assert.equal(created.data.vehicles.length, 4);

  const deleted = await apiRequest(`/api/vehicles/${created.record.id}`, { method: "DELETE" });
  assert.equal(deleted.data.vehicles.length, 3);

  delete globalThis.localStorage;
  delete globalThis.window;
});
