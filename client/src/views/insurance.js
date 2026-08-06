import { alertBox, emptyState, field, pageIntro, panel, recordCard, submitButton } from "../components.js";
import { escapeHtml, bindDeleteButtons, daysUntil, formatDate, formatMoney, formToObject } from "../utils.js";

export function insuranceView(data) {
  const vehicleName = (id) => data.vehicles.find((vehicle) => vehicle.id === id)?.name || "Unknown vehicle";
  const vehicleOptions = data.vehicles.map((vehicle) => `<option value="${escapeHtml(vehicle.id)}">${escapeHtml(vehicle.name)} — ${escapeHtml(vehicle.plate)}</option>`).join("");
  const form = `<form class="form-grid" id="insurance-form">
    ${field("Vehicle", `<select required name="vehicleId"><option value="">Choose a vehicle</option>${vehicleOptions}</select>`, { wide: true })}
    ${field("Insurance provider", '<input required name="provider" placeholder="Provider name" />')}
    ${field("Policy number", '<input name="policyNumber" placeholder="POL-2026-001" />')}
    ${field("Expiry date", '<input required type="date" name="expiryDate" />')}
    ${field("Premium amount", '<input type="number" name="premium" min="0" step="0.01" placeholder="12000" />')}
    ${submitButton("Save policy", "shield")}
  </form>`;

  const list = data.insuranceRecords.length
    ? `<div class="record-list">${[...data.insuranceRecords].sort((a, b) => a.expiryDate.localeCompare(b.expiryDate)).map((record) => {
        const days = daysUntil(record.expiryDate);
        const status = days < 0 ? `Expired ${Math.abs(days)} days ago` : days === 0 ? "Expires today" : `${days} days remaining`;
        return recordCard({
          title: record.provider,
          badge: status,
          danger: days <= 30,
          lines: [
            `${vehicleName(record.vehicleId)} • Policy ${record.policyNumber || "not provided"}`,
            `Expires ${formatDate(record.expiryDate)} • Premium ${formatMoney(record.premium)}`,
          ],
          collection: "insuranceRecords",
          id: record.id,
          deleteMessage: "Insurance policy deleted.",
          confirmMessage: "Delete this insurance policy?",
        });
      }).join("")}</div>`
    : emptyState("No insurance policies", "Policy status and expiry reminders will appear here.");

  return {
    html: `<div class="page">${pageIntro("Insurance policies", "Store policy information and identify expired or soon-to-expire vehicle coverage.")}${data.vehicles.length === 0 ? alertBox("Add a vehicle before creating an insurance policy.") : ""}<div class="split-layout">${panel({ title: "Add insurance policy", subtitle: "Use the details from the current policy document.", content: form })}${panel({ title: "Coverage status", subtitle: "Policies sorted by nearest expiry", content: list })}</div></div>`,
    mount(root, context) {
      const formElement = root.querySelector("#insurance-form");
      if (data.vehicles.length === 0) formElement?.querySelector("button[type='submit']")?.setAttribute("disabled", "");
      formElement?.addEventListener("submit", async (event) => {
        event.preventDefault();
        const button = event.currentTarget.querySelector("button[type='submit']");
        button.disabled = true;
        const saved = await context.createRecord("insuranceRecords", formToObject(event.currentTarget), "Insurance policy saved.");
        if (!saved) button.disabled = false;
      });
      bindDeleteButtons(root, context.deleteRecord);
    },
  };
}
