import { emptyState, field, pageIntro, panel, recordCard, submitButton } from "../components.js";
import { icon } from "../icons.js";
import { bindDeleteButtons, formatMoney, formToObject } from "../utils.js";

function directoryList(items, collection, user) {
  if (!items.length) return emptyState(`No ${collection === "pumps" ? "petrol pumps" : "garages"} listed`, "Directory records will appear here.");
  return `<div class="directory-grid">${items.map((item) => {
    const canDelete = user.role === "admin" || item.ownerId === user.id;
    const details = collection === "pumps"
      ? (item.fuelPrice === null ? "Fuel price not listed" : `${formatMoney(item.fuelPrice)} per litre`)
      : (item.serviceType || "Service details not listed");
    const mapLink = item.lat !== null && item.lng !== null && item.lat !== "" && item.lng !== ""
      ? `<a class="text-link" target="_blank" rel="noreferrer" href="https://www.google.com/maps?q=${Number(item.lat)},${Number(item.lng)}">${icon("map", 16)} View on Google Maps</a>`
      : "";
    return recordCard({
      title: item.name,
      badge: item.area,
      lines: [details, `Phone: ${item.phone || "Not provided"}`],
      collection: canDelete ? collection : "",
      id: canDelete ? item.id : "",
      deleteMessage: "Directory listing deleted.",
      confirmMessage: "Delete this directory listing?",
      extra: mapLink,
    });
  }).join("")}</div>`;
}

function pumpForm() {
  return `<form class="form-grid directory-form" id="pump-form">
    ${field("Pump name", '<input required name="name" placeholder="DriveFuel Central" />')}
    ${field("Area", '<input required name="area" placeholder="Uttara, Dhaka" />')}
    ${field("Fuel price per litre", '<input type="number" name="fuelPrice" min="0" step="0.01" placeholder="128" />')}
    ${field("Phone", '<input type="tel" name="phone" placeholder="+880 1XXXXXXXXX" />')}
    ${field("Latitude", '<input type="number" name="lat" step="any" placeholder="23.8103" />')}
    ${field("Longitude", '<input type="number" name="lng" step="any" placeholder="90.4125" />')}
    ${submitButton("Add petrol pump", "fuel")}
  </form>`;
}

function garageForm() {
  return `<form class="form-grid directory-form" id="garage-form">
    ${field("Garage name", '<input required name="name" placeholder="DriveCare Auto Service" />')}
    ${field("Area", '<input required name="area" placeholder="Mirpur, Dhaka" />')}
    ${field("Service type", '<input name="serviceType" placeholder="Car and motorcycle servicing" />')}
    ${field("Phone", '<input type="tel" name="phone" placeholder="+880 1XXXXXXXXX" />')}
    ${field("Latitude", '<input type="number" name="lat" step="any" placeholder="23.7806" />')}
    ${field("Longitude", '<input type="number" name="lng" step="any" placeholder="90.2794" />')}
    ${submitButton("Add garage", "directory")}
  </form>`;
}

export function directoryView(data, user, activeForm = "pump") {
  return {
    html: `<div class="page">
      ${pageIntro("Service directory", "Maintain a practical list of petrol pumps, workshops, and service centres with map links.")}
      <div class="directory-sections">
        ${panel({ title: "Petrol pumps", subtitle: `${data.pumps.length} public listing${data.pumps.length === 1 ? "" : "s"}`, action: icon("fuel", 21), content: directoryList(data.pumps, "pumps", user) })}
        ${panel({ title: "Garages and workshops", subtitle: `${data.garages.length} public listing${data.garages.length === 1 ? "" : "s"}`, action: icon("service", 21), content: directoryList(data.garages, "garages", user) })}
      </div>
      ${panel({
        title: "Add directory listing",
        subtitle: "Only listing owners and administrators can delete their records.",
        content: `<div class="segmented-control"><button type="button" data-directory-form="pump" class="${activeForm === "pump" ? "segmented-control__active" : ""}">${icon("fuel", 17)} Petrol pump</button><button type="button" data-directory-form="garage" class="${activeForm === "garage" ? "segmented-control__active" : ""}">${icon("directory", 17)} Garage</button></div>${activeForm === "pump" ? pumpForm() : garageForm()}`,
      })}
    </div>`,
    mount(root, context) {
      root.querySelectorAll("[data-directory-form]").forEach((button) => {
        button.addEventListener("click", () => context.setDirectoryForm(button.dataset.directoryForm));
      });
      root.querySelector("#pump-form")?.addEventListener("submit", async (event) => {
        event.preventDefault();
        const button = event.currentTarget.querySelector("button[type='submit']");
        button.disabled = true;
        const saved = await context.createRecord("pumps", formToObject(event.currentTarget), "Petrol pump added to the directory.");
        if (!saved) button.disabled = false;
      });
      root.querySelector("#garage-form")?.addEventListener("submit", async (event) => {
        event.preventDefault();
        const button = event.currentTarget.querySelector("button[type='submit']");
        button.disabled = true;
        const saved = await context.createRecord("garages", formToObject(event.currentTarget), "Garage added to the directory.");
        if (!saved) button.disabled = false;
      });
      bindDeleteButtons(root, context.deleteRecord);
    },
  };
}
