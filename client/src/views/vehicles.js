import { emptyState, field, pageIntro, panel, recordCard, submitButton } from "../components.js";
import { fuelTypes, vehicleTypes } from "../constants.js";
import { bindDeleteButtons, formatNumber, formToObject, latestMileage } from "../utils.js";

export function vehiclesView(data) {
  const options = (items) => items.map((item) => `<option>${item}</option>`).join("");
  const list = data.vehicles.length
    ? `<div class="record-list">${data.vehicles.map((vehicle) => {
        const mileage = latestMileage(vehicle.id, data.fuelLogs);
        return recordCard({
          title: vehicle.name,
          badge: vehicle.type,
          lines: [
            `${vehicle.brand || "Brand not set"} ${vehicle.model || ""} • ${vehicle.plate}`,
            `${vehicle.fuelType || "Fuel not set"} • Odometer ${formatNumber(vehicle.odometer, 1)} km`,
            mileage === null ? "Mileage: add two fuel logs" : `Mileage: ${formatNumber(mileage)} km/L`,
          ],
          collection: "vehicles",
          id: vehicle.id,
          deleteMessage: "Vehicle deleted.",
          confirmMessage: "Delete this vehicle and all related records?",
        });
      }).join("")}</div>`
    : emptyState("Your registry is empty", "Complete the form to create the first vehicle record.");

  const form = `<form class="form-grid" id="vehicle-form">
    ${field("Vehicle name", '<input required name="name" placeholder="My Toyota Corolla" />', { wide: true })}
    ${field("Vehicle type", `<select name="type">${options(vehicleTypes)}</select>`)}
    ${field("Plate number", '<input required name="plate" placeholder="DHAKA-METRO-GA-12-3456" />')}
    ${field("Brand", '<input name="brand" placeholder="Toyota" />')}
    ${field("Model", '<input name="model" placeholder="Corolla" />')}
    ${field("Manufacturing year", `<input type="number" name="year" min="1886" max="${new Date().getFullYear() + 1}" placeholder="2022" />`)}
    ${field("Fuel type", `<select name="fuelType">${options(fuelTypes)}</select>`)}
    ${field("Current odometer", '<input type="number" name="odometer" min="0" step="0.1" placeholder="25000" />')}
    ${submitButton("Add vehicle")}
  </form>`;

  return {
    html: `<div class="page">${pageIntro("Vehicle registry", "Create a clean record for every car, motorcycle, truck, or other vehicle you manage.")}<div class="split-layout">${panel({ title: "Add vehicle", subtitle: "Use the registration details shown on the vehicle documents.", content: form })}${panel({ title: "Your vehicles", subtitle: `${data.vehicles.length} registered vehicle${data.vehicles.length === 1 ? "" : "s"}`, content: list })}</div></div>`,
    mount(root, context) {
      root.querySelector("#vehicle-form")?.addEventListener("submit", async (event) => {
        event.preventDefault();
        const button = event.currentTarget.querySelector("button[type='submit']");
        button.disabled = true;
        const saved = await context.createRecord("vehicles", formToObject(event.currentTarget), "Vehicle added successfully.");
        if (!saved) button.disabled = false;
      });
      bindDeleteButtons(root, context.deleteRecord);
    },
  };
}
