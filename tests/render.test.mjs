import assert from "node:assert/strict";
import test from "node:test";
import { emptyData } from "../client/src/constants.js";
import { renderAuth } from "../client/src/views/auth.js";
import { dashboardView } from "../client/src/views/dashboard.js";
import { directoryView } from "../client/src/views/directory.js";
import { fuelView } from "../client/src/views/fuel.js";
import { insuranceView } from "../client/src/views/insurance.js";
import { serviceView } from "../client/src/views/service.js";
import { trackingView } from "../client/src/views/tracking.js";
import { vehiclesView } from "../client/src/views/vehicles.js";
import { adminView } from "../client/src/views/admin.js";

const data = structuredClone(emptyData);
const user = { id: "user-1", name: "Test User", role: "admin", email: "test@example.com" };

test("all frontend views render without runtime errors", () => {
  const outputs = [
    renderAuth("login"),
    dashboardView(data).html,
    vehiclesView(data).html,
    fuelView(data).html,
    trackingView(data).html,
    serviceView(data).html,
    insuranceView(data).html,
    directoryView(data, user, "pump").html,
    adminView(data).html,
  ];
  for (const output of outputs) {
    assert.equal(typeof output, "string");
    assert.ok(output.length > 100);
  }
});
