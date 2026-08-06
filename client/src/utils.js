export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function formToObject(form) {
  return Object.fromEntries(new FormData(form).entries());
}

export function formatMoney(value) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

export function formatNumber(value, maximumFractionDigits = 2) {
  return new Intl.NumberFormat("en-BD", { maximumFractionDigits }).format(Number(value || 0));
}

export function formatDate(value) {
  if (!value) return "Not set";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return escapeHtml(value);
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

export function formatDateTime(value) {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return escapeHtml(value);
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function daysUntil(value) {
  if (!value) return null;
  const target = new Date(`${value}T23:59:59`);
  if (Number.isNaN(target.getTime())) return null;
  return Math.ceil((target.getTime() - Date.now()) / 86_400_000);
}

export function calculateMileage(log, allLogs) {
  const sorted = allLogs
    .filter((item) => item.vehicleId === log.vehicleId)
    .sort((a, b) => Number(a.odometer) - Number(b.odometer));
  const index = sorted.findIndex((item) => item.id === log.id);
  if (index <= 0) return null;
  const distance = Number(log.odometer) - Number(sorted[index - 1].odometer);
  const liters = Number(log.liters);
  return distance > 0 && liters > 0 ? distance / liters : null;
}

export function latestMileage(vehicleId, logs) {
  const sorted = logs
    .filter((item) => item.vehicleId === vehicleId)
    .sort((a, b) => Number(a.odometer) - Number(b.odometer));
  return sorted.length >= 2 ? calculateMileage(sorted.at(-1), sorted) : null;
}

export function bindDeleteButtons(root, deleteRecord) {
  root.querySelectorAll("[data-delete-collection]").forEach((button) => {
    button.addEventListener("click", async () => {
      const question = button.dataset.confirm || "Delete this record permanently?";
      if (!window.confirm(question)) return;
      await deleteRecord(button.dataset.deleteCollection, button.dataset.deleteId, button.dataset.success || "Record deleted.");
    });
  });
}
