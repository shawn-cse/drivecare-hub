import { alertBox, emptyState, field, pageIntro, panel, recordCard, submitButton } from "../components.js";
import { escapeHtml, bindDeleteButtons, daysUntil, formatDate, formatMoney, formToObject } from "../utils.js";

export function serviceView(data) {
  const vehicleName = (id) => data.vehicles.find((vehicle) => vehicle.id === id)?.name || "Unknown vehicle";
  const vehicleOptions = data.vehicles.map((vehicle) => `<option value="${escapeHtml(vehicle.id)}">${escapeHtml(vehicle.name)} — ${escapeHtml(vehicle.plate)}</option>`).join("");
  const form = `<form class="form-grid" id="service-form">
    ${field("Vehicle", `<select required name="vehicleId"><option value="">Choose a vehicle</option>${vehicleOptions}</select>`, { wide: true })}
    ${field("Garage or workshop", '<input required name="garageName" placeholder="DriveCare Auto Service" />')}
    ${field("Service type", '<input required name="serviceType" placeholder="Engine oil and filter" />')}
    ${field("Service date", `<input required type="date" name="serviceDate" value="${new Date().toISOString().slice(0, 10)}" />`)}
    ${field("Next service date", '<input type="date" name="nextServiceDate" />')}
    ${field("Service cost", '<input type="number" name="cost" min="0" step="0.01" placeholder="3500" />')}
    ${field("Notes", '<textarea name="notes" placeholder="Parts replaced, observations, warranty details…"></textarea>', { wide: true })}
    ${submitButton("Save maintenance", "service")}
  </form>`;

  const list = data.serviceRecords.length
    ? `<div class="record-list">${[...data.serviceRecords].sort((a, b) => b.serviceDate.localeCompare(a.serviceDate)).map((record) => {
        const days = daysUntil(record.nextServiceDate);
        const badge = record.nextServiceDate ? (days < 0 ? "Service overdue" : `${days} days to next service`) : formatDate(record.serviceDate);
        return recordCard({
          title: record.serviceType,
          badge,
          danger: days !== null && days <= 7,
          lines: [
            `${vehicleName(record.vehicleId)} • ${record.garageName}`,
            `${formatDate(record.serviceDate)} • ${formatMoney(record.cost)}`,
            record.nextServiceDate ? `Next service: ${formatDate(record.nextServiceDate)}` : "Next service date not set",
            record.notes || "No additional notes",
          ],
          collection: "serviceRecords",
          id: record.id,
          deleteMessage: "Maintenance record deleted.",
          confirmMessage: "Delete this maintenance record?",
        });
      }).join("")}</div>`
    : emptyState("No maintenance history", "Saved service records will appear in this section.");

  return {
    html: `<div class="page">${pageIntro("Maintenance records", "Keep repair costs, completed work, garages, and future service dates organised.")}${data.vehicles.length === 0 ? alertBox("Add a vehicle before creating a maintenance record.") : ""}<div class="split-layout">${panel({ title: "Add maintenance", subtitle: "Record completed service and schedule the next visit.", content: form })}${panel({ title: "Service history", subtitle: "Completed and upcoming work", content: list })}</div></div>`,
    mount(root, context) {
      const formElement = root.querySelector("#service-form");
      if (data.vehicles.length === 0) formElement?.querySelector("button[type='submit']")?.setAttribute("disabled", "");
      formElement?.addEventListener("submit", async (event) => {
        event.preventDefault();
        const button = event.currentTarget.querySelector("button[type='submit']");
        button.disabled = true;
        const saved = await context.createRecord("serviceRecords", formToObject(event.currentTarget), "Maintenance record saved.");
        if (!saved) button.disabled = false;
      });
      bindDeleteButtons(root, context.deleteRecord);
    },
  };
}
