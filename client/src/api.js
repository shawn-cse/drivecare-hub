import {
  demoAdministrator,
  getDemoDatabase,
  getDemoUser,
  resetDemoDatabase,
  saveDemoDatabase,
  saveDemoUser,
} from "./demo-data.js";

const TOKEN_KEY = "drivecare-auth-token";
const DEMO_TOKEN = "drivecare-github-pages-demo";
const params = new URLSearchParams(window.location.search);

export function isDemoMode() {
  return window.location.protocol === "file:"
    || window.location.hostname.endsWith("github.io")
    || params.get("demo") === "1";
}

export function getToken() {
  if (isDemoMode()) return localStorage.getItem(TOKEN_KEY) || DEMO_TOKEN;
  return localStorage.getItem(TOKEN_KEY) || "";
}

export function saveToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

function uid(prefix) {
  const value = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${value}`;
}

function fail(message) {
  throw new Error(message);
}

function visibleData(database, user) {
  if (user.role === "admin") return structuredClone(database);
  const vehicles = database.vehicles.filter((item) => item.userId === user.id);
  const vehicleIds = new Set(vehicles.map((item) => item.id));
  return {
    users: [user],
    vehicles,
    fuelLogs: database.fuelLogs.filter((item) => vehicleIds.has(item.vehicleId)),
    serviceRecords: database.serviceRecords.filter((item) => vehicleIds.has(item.vehicleId)),
    insuranceRecords: database.insuranceRecords.filter((item) => vehicleIds.has(item.vehicleId)),
    locations: database.locations.filter((item) => vehicleIds.has(item.vehicleId)),
    pumps: structuredClone(database.pumps),
    garages: structuredClone(database.garages),
  };
}

function numberValue(value, fallback = 0) {
  if (value === "" || value === null || value === undefined) return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) fail("Enter a valid numeric value.");
  return parsed;
}

function createDemoRecord(collection, body, user, database) {
  const now = new Date().toISOString();
  const vehicle = body.vehicleId
    ? database.vehicles.find((item) => item.id === body.vehicleId)
    : null;
  if (body.vehicleId && !vehicle) fail("Choose a valid vehicle.");

  if (collection === "vehicles") {
    if (!body.name || !body.type || !body.plate) fail("Name, vehicle type, and plate number are required.");
    const plate = String(body.plate).trim().toUpperCase();
    if (database.vehicles.some((item) => item.plate === plate)) fail("A vehicle with this plate number already exists.");
    return {
      id: uid("vehicle"),
      userId: user.id,
      name: String(body.name).trim(),
      type: String(body.type).trim(),
      plate,
      brand: String(body.brand || "").trim(),
      model: String(body.model || "").trim(),
      year: body.year ? numberValue(body.year, null) : null,
      fuelType: String(body.fuelType || "").trim(),
      odometer: numberValue(body.odometer, 0),
      createdAt: now,
    };
  }

  if (collection === "fuelLogs") {
    if (!body.vehicleId || !body.liters || !body.odometer || !body.date) fail("Vehicle, fuel amount, odometer, and date are required.");
    const odometer = numberValue(body.odometer);
    const previous = database.fuelLogs
      .filter((item) => item.vehicleId === body.vehicleId)
      .sort((a, b) => Number(b.odometer) - Number(a.odometer))[0];
    if (previous && odometer <= Number(previous.odometer)) fail("Odometer must be greater than the previous fuel log.");
    const liters = numberValue(body.liters);
    const pricePerLiter = numberValue(body.pricePerLiter, 0);
    return {
      id: uid("fuel"),
      vehicleId: body.vehicleId,
      liters,
      pricePerLiter,
      totalCost: liters * pricePerLiter,
      odometer,
      pumpName: String(body.pumpName || "").trim(),
      date: body.date,
      createdAt: now,
    };
  }

  if (collection === "serviceRecords") {
    if (!body.vehicleId || !body.garageName || !body.serviceType || !body.serviceDate) fail("Complete the required maintenance fields.");
    return {
      id: uid("service"),
      vehicleId: body.vehicleId,
      garageName: String(body.garageName).trim(),
      serviceType: String(body.serviceType).trim(),
      serviceDate: body.serviceDate,
      nextServiceDate: body.nextServiceDate || "",
      cost: numberValue(body.cost, 0),
      notes: String(body.notes || "").trim(),
      createdAt: now,
    };
  }

  if (collection === "insuranceRecords") {
    if (!body.vehicleId || !body.provider || !body.expiryDate) fail("Vehicle, provider, and expiry date are required.");
    return {
      id: uid("insurance"),
      vehicleId: body.vehicleId,
      provider: String(body.provider).trim(),
      policyNumber: String(body.policyNumber || "").trim(),
      expiryDate: body.expiryDate,
      premium: numberValue(body.premium, 0),
      createdAt: now,
    };
  }

  if (collection === "locations") {
    if (!body.vehicleId) fail("Choose a vehicle first.");
    return {
      id: uid("location"),
      vehicleId: body.vehicleId,
      lat: numberValue(body.lat),
      lng: numberValue(body.lng),
      accuracy: numberValue(body.accuracy, 0),
      recordedAt: now,
      createdAt: now,
    };
  }

  if (collection === "pumps") {
    if (!body.name || !body.area) fail("Pump name and area are required.");
    return {
      id: uid("pump"),
      ownerId: user.id,
      name: String(body.name).trim(),
      area: String(body.area).trim(),
      fuelPrice: body.fuelPrice ? numberValue(body.fuelPrice) : null,
      phone: String(body.phone || "").trim(),
      lat: body.lat ? numberValue(body.lat) : null,
      lng: body.lng ? numberValue(body.lng) : null,
      createdAt: now,
    };
  }

  if (collection === "garages") {
    if (!body.name || !body.area) fail("Garage name and area are required.");
    return {
      id: uid("garage"),
      ownerId: user.id,
      name: String(body.name).trim(),
      area: String(body.area).trim(),
      serviceType: String(body.serviceType || "").trim(),
      phone: String(body.phone || "").trim(),
      lat: body.lat ? numberValue(body.lat) : null,
      lng: body.lng ? numberValue(body.lng) : null,
      createdAt: now,
    };
  }

  fail("This demo action is not supported.");
}

async function demoRequest(path, options = {}) {
  const method = String(options.method || "GET").toUpperCase();
  const body = options.body ? JSON.parse(options.body) : {};
  let database = getDemoDatabase();
  let user = getDemoUser() || demoAdministrator;

  if (path === "/api/auth/session" && method === "GET") {
    saveDemoUser(user);
    return { user, data: visibleData(database, user) };
  }

  if (path === "/api/auth/login" && method === "POST") {
    if (String(body.email || "").toLowerCase() !== "admin@drivecare.app" || body.password !== "admin123") {
      fail("For this demo, use admin@drivecare.app and password admin123.");
    }
    user = demoAdministrator;
    saveDemoUser(user);
    saveToken(DEMO_TOKEN);
    return { token: DEMO_TOKEN, user, data: visibleData(database, user) };
  }

  if (path === "/api/auth/register" && method === "POST") {
    if (!body.name || !body.email || String(body.password || "").length < 8) fail("Enter a name, valid email, and password of at least 8 characters.");
    if (database.users.some((item) => item.email.toLowerCase() === String(body.email).toLowerCase())) fail("An account already exists for this email.");
    user = {
      id: uid("user"),
      name: String(body.name).trim(),
      email: String(body.email).trim().toLowerCase(),
      role: body.role || "owner",
      createdAt: new Date().toISOString(),
    };
    database.users.push(user);
    saveDemoDatabase(database);
    saveDemoUser(user);
    saveToken(DEMO_TOKEN);
    return { token: DEMO_TOKEN, user, data: visibleData(database, user) };
  }

  if (path === "/api/auth/logout" && method === "POST") {
    saveDemoUser(null);
    saveToken("");
    return { message: "Demo session cleared." };
  }

  if (path === "/api/data" && method === "GET") return { data: visibleData(database, user) };

  if (path === "/api/demo/reset" && method === "POST") {
    database = resetDemoDatabase();
    user = demoAdministrator;
    saveToken(DEMO_TOKEN);
    return { user, data: visibleData(database, user) };
  }

  const createMatch = path.match(/^\/api\/(vehicles|fuelLogs|serviceRecords|insuranceRecords|locations|pumps|garages)$/);
  if (createMatch && method === "POST") {
    const collection = createMatch[1];
    const record = createDemoRecord(collection, body, user, database);
    database[collection].push(record);
    saveDemoDatabase(database);
    return { record, data: visibleData(database, user) };
  }

  const deleteMatch = path.match(/^\/api\/(vehicles|fuelLogs|serviceRecords|insuranceRecords|locations|pumps|garages)\/([^/]+)$/);
  if (deleteMatch && method === "DELETE") {
    const [, collection, encodedId] = deleteMatch;
    const id = decodeURIComponent(encodedId);
    if (collection === "vehicles") {
      for (const related of ["fuelLogs", "serviceRecords", "insuranceRecords", "locations"]) {
        database[related] = database[related].filter((item) => item.vehicleId !== id);
      }
    }
    database[collection] = database[collection].filter((item) => item.id !== id);
    saveDemoDatabase(database);
    return { message: "Record deleted.", data: visibleData(database, user) };
  }

  fail("The demo request could not be completed.");
}

export async function apiRequest(path, options = {}) {
  if (isDemoMode()) return demoRequest(path, options);

  const headers = new Headers(options.headers || {});
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (options.body && !(options.body instanceof FormData)) headers.set("Content-Type", "application/json");

  let response;
  try {
    response = await fetch(path, { ...options, headers });
  } catch {
    throw new Error("Cannot connect to the server. Please check that DriveCare Hub is running.");
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401) saveToken("");
    throw new Error(payload.message || "The request could not be completed.");
  }
  return payload;
}
