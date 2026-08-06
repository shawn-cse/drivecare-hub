import { emptyState, pageIntro, panel, statCard } from "../components.js";
import { roleLabels } from "../constants.js";
import { escapeHtml, formatDateTime } from "../utils.js";

export function adminView(data) {
  const users = data.users.length
    ? `<div class="user-table" role="table" aria-label="Registered users"><div class="user-table__row user-table__head" role="row"><span>Name</span><span>Email</span><span>Role</span><span>Created</span></div>${data.users.map((user) => `<div class="user-table__row" role="row"><strong>${escapeHtml(user.name)}</strong><span>${escapeHtml(user.email)}</span><span class="tag">${escapeHtml(roleLabels[user.role] || user.role)}</span><span>${escapeHtml(formatDateTime(user.createdAt))}</span></div>`).join("")}</div>`
    : emptyState("Nothing here yet", "No users found.");
  return {
    html: `<div class="page">
      ${pageIntro("Platform administration", "Review system totals and registered users without exposing password information.")}
      <div class="stats-grid stats-grid--three">
        ${statCard("users", "Users", String(data.users.length), "Registered accounts")}
        ${statCard("car", "Vehicles", String(data.vehicles.length), "Across all accounts")}
        ${statCard("fuel", "Fuel logs", String(data.fuelLogs.length), "All fill-up records")}
        ${statCard("service", "Maintenance", String(data.serviceRecords.length), "Service records")}
        ${statCard("shield", "Insurance", String(data.insuranceRecords.length), "Stored policies")}
        ${statCard("directory", "Directory", String(data.pumps.length + data.garages.length), "Pumps and garages")}
      </div>
      ${panel({ title: "Registered users", subtitle: "Safe account metadata returned by the backend", content: users })}
    </div>`,
    mount() {},
  };
}
