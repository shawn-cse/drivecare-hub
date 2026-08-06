import { alertBox, emptyState, field, pageIntro, panel, recordCard } from "../components.js";
import { icon } from "../icons.js";
import { escapeHtml, bindDeleteButtons, formatDateTime, formatNumber } from "../utils.js";

export function trackingView(data) {
  const vehicleName = (id) => data.vehicles.find((vehicle) => vehicle.id === id)?.name || "Unknown vehicle";
  const vehicleOptions = data.vehicles.map((vehicle) => `<option value="${escapeHtml(vehicle.id)}">${escapeHtml(vehicle.name)} — ${escapeHtml(vehicle.plate)}</option>`).join("");
  const form = `<div class="form-grid location-form">
    ${field("Vehicle", `<select id="location-vehicle"><option value="">Choose a vehicle</option>${vehicleOptions}</select>`, { wide: true })}
    <button class="button button--primary form-submit" id="save-location" type="button" disabled>${icon("location", 18)}<span>Save current location</span></button>
  </div>`;

  const list = data.locations.length
    ? `<div class="record-list">${[...data.locations].reverse().map((location) => recordCard({
        title: vehicleName(location.vehicleId),
        badge: formatDateTime(location.recordedAt || location.createdAt),
        lines: [
          `${formatNumber(location.lat, 6)}, ${formatNumber(location.lng, 6)}`,
          `Accuracy: approximately ${formatNumber(location.accuracy, 0)} metres`,
        ],
        collection: "locations",
        id: location.id,
        deleteMessage: "Location deleted.",
        confirmMessage: "Delete this saved location?",
        extra: `<a class="text-link" target="_blank" rel="noreferrer" href="https://www.google.com/maps?q=${Number(location.lat)},${Number(location.lng)}">${icon("map", 16)} Open in Google Maps</a>`,
      })).join("")}</div>`
    : emptyState("No locations saved", "Capture the first location to create a map-ready history.");

  return {
    html: `<div class="page">${pageIntro("Saved locations", "Capture a vehicle’s current browser location and open previous points directly in Google Maps.")}${alertBox("This feature stores location snapshots only. Continuous GPS tracking requires dedicated hardware or a mobile application.")}<div class="split-layout">${panel({ title: "Capture location", subtitle: "Your browser will ask for location permission.", content: form })}${panel({ title: "Location history", subtitle: `${data.locations.length} saved point${data.locations.length === 1 ? "" : "s"}`, content: list })}</div></div>`,
    mount(root, context) {
      const select = root.querySelector("#location-vehicle");
      const button = root.querySelector("#save-location");
      select?.addEventListener("change", () => { button.disabled = !select.value; });
      button?.addEventListener("click", () => {
        if (!navigator.geolocation) {
          context.showNotice("Geolocation is not supported by this browser.", "error");
          return;
        }
        button.disabled = true;
        button.querySelector("span").textContent = "Finding location…";
        navigator.geolocation.getCurrentPosition(
          async ({ coords }) => {
            const saved = await context.createRecord("locations", {
              vehicleId: select.value,
              lat: coords.latitude,
              lng: coords.longitude,
              accuracy: coords.accuracy,
            }, "Current location saved.");
            if (!saved) {
              button.disabled = false;
              button.querySelector("span").textContent = "Save current location";
            }
          },
          () => {
            context.showNotice("Location permission was denied or the location is unavailable.", "error");
            button.disabled = false;
            button.querySelector("span").textContent = "Save current location";
          },
          { enableHighAccuracy: true, timeout: 12_000, maximumAge: 30_000 },
        );
      });
      bindDeleteButtons(root, context.deleteRecord);
    },
  };
}
