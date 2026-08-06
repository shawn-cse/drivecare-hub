import { alertBox, emptyState, field, pageIntro, panel, recordCard, submitButton } from "../components.js";
import { escapeHtml, bindDeleteButtons, calculateMileage, formatDate, formatMoney, formatNumber, formToObject } from "../utils.js";

export function fuelView(data) {
  const vehicleName = (id) => data.vehicles.find((vehicle) => vehicle.id === id)?.name || "Unknown vehicle";
  const vehicleOptions = data.vehicles.map((vehicle) => `<option value="${escapeHtml(vehicle.id)}">${escapeHtml(vehicle.name)} — ${escapeHtml(vehicle.plate)}</option>`).join("");
  const form = `<form class="form-grid" id="fuel-form">
    ${field("Vehicle", `<select required name="vehicleId"><option value="">Choose a vehicle</option>${vehicleOptions}</select>`, { wide: true })}
    ${field("Fuel quantity (L)", '<input required type="number" name="liters" min="0.01" step="0.01" placeholder="20" />')}
    ${field("Price per litre", '<input type="number" name="pricePerLiter" min="0" step="0.01" placeholder="128" />')}
    ${field("Odometer (km)", '<input required type="number" name="odometer" min="0" step="0.1" placeholder="25250" />')}
    ${field("Fill-up date", `<input required type="date" name="date" value="${new Date().toISOString().slice(0, 10)}" />`)}
    ${field("Petrol pump", '<input name="pumpName" placeholder="Pump or station name" />', { wide: true })}
    ${submitButton("Save fill-up", "fuel")}
  </form>`;

  const list = data.fuelLogs.length
    ? `<div class="record-list">${[...data.fuelLogs].sort((a, b) => b.date.localeCompare(a.date)).map((log) => {
        const mileage = calculateMileage(log, data.fuelLogs);
        return recordCard({
          title: vehicleName(log.vehicleId),
          badge: formatDate(log.date),
          lines: [
            `${formatNumber(log.liters)} L • Odometer ${formatNumber(log.odometer, 1)} km`,
            `${formatMoney(log.totalCost)}${log.pumpName ? ` • ${log.pumpName}` : ""}`,
            mileage === null ? "Mileage: needs a previous fill-up" : `Mileage: ${formatNumber(mileage)} km/L`,
          ],
          collection: "fuelLogs",
          id: log.id,
          deleteMessage: "Fuel record deleted.",
          confirmMessage: "Delete this fuel record?",
        });
      }).join("")}</div>`
    : emptyState("No fuel records", "Your fuel costs and mileage calculations will appear here.");

  return {
    html: `<div class="page">${pageIntro("Fuel and mileage", "Log every fill-up and calculate real-world fuel efficiency from odometer readings.")}${data.vehicles.length === 0 ? alertBox("Add a vehicle before creating a fuel record.") : ""}<div class="split-layout">${panel({ title: "Record a fill-up", subtitle: "The odometer must be higher than the previous fuel record.", content: form })}${panel({ title: "Mileage history", subtitle: "Mileage = distance travelled ÷ fuel filled", content: list })}</div></div>`,
    mount(root, context) {
      const formElement = root.querySelector("#fuel-form");
      if (data.vehicles.length === 0) formElement?.querySelector("button[type='submit']")?.setAttribute("disabled", "");
      formElement?.addEventListener("submit", async (event) => {
        event.preventDefault();
        const button = event.currentTarget.querySelector("button[type='submit']");
        button.disabled = true;
        const saved = await context.createRecord("fuelLogs", formToObject(event.currentTarget), "Fuel record saved.");
        if (!saved) button.disabled = false;
      });
      bindDeleteButtons(root, context.deleteRecord);
    },
  };
}
