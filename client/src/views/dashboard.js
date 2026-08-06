import { emptyState, pageIntro, panel, recordCard, statCard, timelineItem } from "../components.js";
import { daysUntil, formatDate, formatMoney, formatNumber, latestMileage } from "../utils.js";

export function dashboardView(data) {
  const totalFuelCost = data.fuelLogs.reduce((sum, item) => sum + Number(item.totalCost || 0), 0);
  const mileageValues = data.vehicles.map((vehicle) => latestMileage(vehicle.id, data.fuelLogs)).filter((value) => value !== null);
  const averageMileage = mileageValues.length ? mileageValues.reduce((sum, value) => sum + value, 0) / mileageValues.length : 0;
  const insuranceAlerts = data.insuranceRecords.filter((item) => {
    const days = daysUntil(item.expiryDate);
    return days !== null && days <= 30;
  });
  const vehicleName = (id) => data.vehicles.find((vehicle) => vehicle.id === id)?.name || "Unknown vehicle";

  const vehicles = data.vehicles.length
    ? `<div class="vehicle-summary-grid">${data.vehicles.map((vehicle) => {
        const mileage = latestMileage(vehicle.id, data.fuelLogs);
        return recordCard({
          title: vehicle.name,
          badge: vehicle.type,
          lines: [
            `${vehicle.brand || "Brand not set"} ${vehicle.model || ""} • ${vehicle.plate}`,
            mileage === null ? "Mileage needs at least two fuel records" : `Latest mileage: ${formatNumber(mileage)} km/L`,
          ],
        });
      }).join("")}</div>`
    : emptyState("No vehicles added", "Add your first vehicle to begin tracking its costs and care history.");

  const fuelTimeline = data.fuelLogs.length
    ? `<div class="timeline">${[...data.fuelLogs].slice(-5).reverse().map((item) => timelineItem(`${vehicleName(item.vehicleId)} — ${item.liters} L, ${formatMoney(item.totalCost)}`)).join("")}</div>`
    : emptyState("Nothing here yet", "Fuel activity will appear here.");

  const upcoming = [...data.serviceRecords]
    .filter((item) => item.nextServiceDate)
    .sort((a, b) => a.nextServiceDate.localeCompare(b.nextServiceDate))
    .slice(0, 5);
  const serviceTimeline = upcoming.length
    ? `<div class="timeline">${upcoming.map((item) => timelineItem(`${vehicleName(item.vehicleId)} — ${item.serviceType}, ${formatDate(item.nextServiceDate)}`)).join("")}</div>`
    : emptyState("Nothing here yet", "Scheduled services will appear here.");

  return {
    html: `<div class="page">
      ${pageIntro("Your vehicle overview", "See operating costs, efficiency, maintenance, and upcoming insurance deadlines at a glance.", '<button class="button button--primary" id="dashboard-add-vehicle" type="button">Add a vehicle</button>')}
      <div class="stats-grid">
        ${statCard("car", "Registered vehicles", String(data.vehicles.length), "Active in your workspace")}
        ${statCard("wallet", "Total fuel spend", formatMoney(totalFuelCost), `${data.fuelLogs.length} fill-up records`)}
        ${statCard("gauge", "Average mileage", `${formatNumber(averageMileage)} km/L`, mileageValues.length ? "Based on latest fill-ups" : "Add two fill-ups per vehicle")}
        ${statCard("warning", "Insurance alerts", String(insuranceAlerts.length), "Expired or due within 30 days")}
      </div>
      <div class="dashboard-grid">
        ${panel({ title: "Fleet snapshot", subtitle: "Latest efficiency for each vehicle", className: "dashboard-grid__wide", content: vehicles })}
        ${panel({ title: "Recent fuel activity", subtitle: "Your five latest fill-ups", content: fuelTimeline })}
        ${panel({ title: "Upcoming maintenance", subtitle: "Next scheduled service dates", content: serviceTimeline })}
      </div>
    </div>`,
    mount(root, context) {
      root.querySelector("#dashboard-add-vehicle")?.addEventListener("click", () => context.navigate("vehicles"));
    },
  };
}
