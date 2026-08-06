import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import test from "node:test";

const projectRoot = path.resolve(import.meta.dirname, "..");
const port = 4317;
const baseUrl = `http://127.0.0.1:${port}`;
let child;
let temporaryDirectory;

async function request(pathname, { method = "GET", token = "", body } = {}) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json();
  return { response, payload };
}

async function waitForServer() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/api/health`);
      if (response.ok) return;
    } catch {
      // Server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("Test server did not start.");
}

test.before(async () => {
  temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), "drivecare-test-"));
  child = spawn(process.execPath, ["server/index.mjs"], {
    cwd: projectRoot,
    env: {
      ...process.env,
      PORT: String(port),
      DATABASE_FILE: path.join(temporaryDirectory, "database.json"),
      SESSION_TTL_HOURS: "1",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  await waitForServer();
});

test.after(async () => {
  child?.kill("SIGTERM");
  await rm(temporaryDirectory, { recursive: true, force: true });
});

test("health endpoint and static frontend are available", async () => {
  const health = await request("/api/health");
  assert.equal(health.response.status, 200);
  assert.equal(health.payload.status, "ok");

  const page = await fetch(`${baseUrl}/`);
  assert.equal(page.status, 200);
  assert.match(await page.text(), /DriveCare Hub/);

  const script = await fetch(`${baseUrl}/src/main.js`);
  assert.equal(script.status, 200);
  assert.match(script.headers.get("content-type"), /javascript/);

  const stylesheet = await fetch(`${baseUrl}/assets/styles.css`);
  assert.equal(stylesheet.status, 200);
  assert.match(stylesheet.headers.get("content-type"), /css/);
});

test("authentication, validation, permissions, and cascade deletion work", async () => {
  const adminLogin = await request("/api/auth/login", {
    method: "POST",
    body: { email: "admin@drivecare.app", password: "admin123" },
  });
  assert.equal(adminLogin.response.status, 200);
  assert.ok(adminLogin.payload.token);
  assert.equal(adminLogin.payload.user.role, "admin");
  assert.equal("passwordHash" in adminLogin.payload.user, false);
  const adminToken = adminLogin.payload.token;

  const createdVehicle = await request("/api/vehicles", {
    method: "POST",
    token: adminToken,
    body: {
      name: "Test Corolla",
      type: "Car",
      plate: "DHAKA-TEST-01",
      brand: "Toyota",
      model: "Corolla",
      year: 2022,
      fuelType: "Petrol",
      odometer: 9900,
    },
  });
  assert.equal(createdVehicle.response.status, 201);
  const vehicleId = createdVehicle.payload.record.id;

  const firstFuel = await request("/api/fuelLogs", {
    method: "POST",
    token: adminToken,
    body: { vehicleId, liters: 20, pricePerLiter: 128, odometer: 10000, date: "2026-08-01" },
  });
  assert.equal(firstFuel.response.status, 201);
  assert.equal(firstFuel.payload.record.totalCost, 2560);

  const invalidFuel = await request("/api/fuelLogs", {
    method: "POST",
    token: adminToken,
    body: { vehicleId, liters: 18, pricePerLiter: 128, odometer: 9999, date: "2026-08-02" },
  });
  assert.equal(invalidFuel.response.status, 400);
  assert.match(invalidFuel.payload.message, /Odometer/);

  const registration = await request("/api/auth/register", {
    method: "POST",
    body: {
      name: "Test Owner",
      email: "owner@example.com",
      password: "secure123",
      role: "owner",
    },
  });
  assert.equal(registration.response.status, 201);
  assert.equal(registration.payload.data.users.length, 1);
  assert.equal(registration.payload.data.vehicles.length, 0);
  const ownerToken = registration.payload.token;

  const forbiddenDelete = await request(`/api/vehicles/${vehicleId}`, {
    method: "DELETE",
    token: ownerToken,
  });
  assert.equal(forbiddenDelete.response.status, 403);

  const deletedVehicle = await request(`/api/vehicles/${vehicleId}`, {
    method: "DELETE",
    token: adminToken,
  });
  assert.equal(deletedVehicle.response.status, 200);
  assert.equal(deletedVehicle.payload.data.vehicles.length, 0);
  assert.equal(deletedVehicle.payload.data.fuelLogs.length, 0);
});

test("unauthenticated private API access is rejected", async () => {
  const result = await request("/api/data");
  assert.equal(result.response.status, 401);
});
