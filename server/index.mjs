import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createToken, hashPassword, verifyPassword } from "./lib/auth.mjs";
import { publicUser, readDatabase, writeDatabase } from "./lib/database.mjs";
import { cleanNumber, cleanText, readJson, sendJson, uid } from "./lib/http.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const clientDirectory = path.join(projectRoot, "client");
const port = Number(process.env.PORT || 4000);
const sessionTtlMs = Number(process.env.SESSION_TTL_HOURS || 24) * 60 * 60 * 1000;
const allowedOrigins = new Set([
  process.env.APP_ORIGIN || "http://localhost:5173",
  `http://localhost:${port}`,
]);

const loginAttempts = new Map();
const validRoles = new Set(["owner", "driver", "pump", "garage"]);
const collections = new Set([
  "vehicles",
  "fuelLogs",
  "serviceRecords",
  "insuranceRecords",
  "locations",
  "pumps",
  "garages",
]);

function corsHeaders(request) {
  const origin = request.headers.origin;
  if (!origin || !allowedOrigins.has(origin)) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    Vary: "Origin",
  };
}

function getBearerToken(request) {
  const header = request.headers.authorization || "";
  return header.startsWith("Bearer ") ? header.slice(7) : "";
}

function findAuthenticatedUser(database, request) {
  const token = getBearerToken(request);
  if (!token) return null;
  const now = Date.now();
  const session = database.sessions.find(
    (item) => item.token === token && new Date(item.expiresAt).getTime() > now,
  );
  if (!session) return null;
  return database.users.find((item) => item.id === session.userId) || null;
}

function userVehicleIds(database, user) {
  return database.vehicles
    .filter((vehicle) => user.role === "admin" || vehicle.userId === user.id)
    .map((vehicle) => vehicle.id);
}

function visibleData(database, user) {
  const vehicleIds = userVehicleIds(database, user);
  const ownsVehicle = (record) => vehicleIds.includes(record.vehicleId);
  return {
    users: user.role === "admin" ? database.users.map(publicUser) : [publicUser(user)],
    vehicles: database.vehicles.filter(
      (vehicle) => user.role === "admin" || vehicle.userId === user.id,
    ),
    fuelLogs: database.fuelLogs.filter((record) => user.role === "admin" || ownsVehicle(record)),
    serviceRecords: database.serviceRecords.filter(
      (record) => user.role === "admin" || ownsVehicle(record),
    ),
    insuranceRecords: database.insuranceRecords.filter(
      (record) => user.role === "admin" || ownsVehicle(record),
    ),
    locations: database.locations.filter((record) => user.role === "admin" || ownsVehicle(record)),
    pumps: database.pumps,
    garages: database.garages,
  };
}

function requireFields(payload, fields) {
  for (const field of fields) {
    if (payload[field] === undefined || payload[field] === null || payload[field] === "") {
      const error = new Error(`${field} is required.`);
      error.statusCode = 400;
      throw error;
    }
  }
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateRecord(collection, body, user, database) {
  const now = new Date().toISOString();
  const ensureOwnedVehicle = (vehicleId) => {
    const vehicle = database.vehicles.find((item) => item.id === vehicleId);
    if (!vehicle || (user.role !== "admin" && vehicle.userId !== user.id)) {
      const error = new Error("Vehicle not found or access denied.");
      error.statusCode = 403;
      throw error;
    }
  };

  if (collection === "vehicles") {
    requireFields(body, ["name", "type", "plate"]);
    const year = body.year ? cleanNumber(body.year, { min: 1886, max: new Date().getFullYear() + 1 }) : null;
    const odometer = body.odometer ? cleanNumber(body.odometer, { min: 0, max: 10_000_000 }) : 0;
    if (body.year && year === null) throw Object.assign(new Error("Enter a valid vehicle year."), { statusCode: 400 });
    if (body.odometer && odometer === null) throw Object.assign(new Error("Enter a valid odometer reading."), { statusCode: 400 });
    return {
      id: uid("vehicle"),
      userId: user.id,
      name: cleanText(body.name, 80),
      type: cleanText(body.type, 30),
      plate: cleanText(body.plate, 30).toUpperCase(),
      brand: cleanText(body.brand, 50),
      model: cleanText(body.model, 50),
      year,
      fuelType: cleanText(body.fuelType, 30),
      odometer,
      createdAt: now,
    };
  }

  if (collection === "fuelLogs") {
    requireFields(body, ["vehicleId", "liters", "odometer", "date"]);
    ensureOwnedVehicle(body.vehicleId);
    const liters = cleanNumber(body.liters, { min: 0.01, max: 10_000 });
    const pricePerLiter = cleanNumber(body.pricePerLiter || 0, { min: 0, max: 100_000 });
    const odometer = cleanNumber(body.odometer, { min: 0, max: 10_000_000 });
    if (liters === null || pricePerLiter === null || odometer === null) {
      throw Object.assign(new Error("Fuel amount, price, or odometer is invalid."), { statusCode: 400 });
    }
    const previousLogs = database.fuelLogs
      .filter((item) => item.vehicleId === body.vehicleId)
      .sort((a, b) => Number(b.odometer) - Number(a.odometer));
    if (previousLogs[0] && odometer <= Number(previousLogs[0].odometer)) {
      throw Object.assign(new Error("Odometer must be greater than the previous fuel log."), { statusCode: 400 });
    }
    return {
      id: uid("fuel"),
      vehicleId: cleanText(body.vehicleId, 80),
      liters,
      pricePerLiter,
      totalCost: liters * pricePerLiter,
      odometer,
      pumpName: cleanText(body.pumpName, 100),
      date: cleanText(body.date, 10),
      createdAt: now,
    };
  }

  if (collection === "serviceRecords") {
    requireFields(body, ["vehicleId", "garageName", "serviceType", "serviceDate"]);
    ensureOwnedVehicle(body.vehicleId);
    const cost = cleanNumber(body.cost || 0, { min: 0, max: 100_000_000 });
    if (cost === null) throw Object.assign(new Error("Service cost is invalid."), { statusCode: 400 });
    return {
      id: uid("service"),
      vehicleId: cleanText(body.vehicleId, 80),
      garageName: cleanText(body.garageName, 100),
      serviceType: cleanText(body.serviceType, 100),
      serviceDate: cleanText(body.serviceDate, 10),
      nextServiceDate: cleanText(body.nextServiceDate, 10),
      cost,
      notes: cleanText(body.notes, 600),
      createdAt: now,
    };
  }

  if (collection === "insuranceRecords") {
    requireFields(body, ["vehicleId", "provider", "expiryDate"]);
    ensureOwnedVehicle(body.vehicleId);
    const premium = cleanNumber(body.premium || 0, { min: 0, max: 100_000_000 });
    if (premium === null) throw Object.assign(new Error("Premium amount is invalid."), { statusCode: 400 });
    return {
      id: uid("insurance"),
      vehicleId: cleanText(body.vehicleId, 80),
      provider: cleanText(body.provider, 100),
      policyNumber: cleanText(body.policyNumber, 100),
      expiryDate: cleanText(body.expiryDate, 10),
      premium,
      createdAt: now,
    };
  }

  if (collection === "locations") {
    requireFields(body, ["vehicleId", "lat", "lng"]);
    ensureOwnedVehicle(body.vehicleId);
    const lat = cleanNumber(body.lat, { min: -90, max: 90 });
    const lng = cleanNumber(body.lng, { min: -180, max: 180 });
    const accuracy = cleanNumber(body.accuracy || 0, { min: 0, max: 100_000 });
    if (lat === null || lng === null || accuracy === null) {
      throw Object.assign(new Error("Location coordinates are invalid."), { statusCode: 400 });
    }
    return {
      id: uid("location"),
      vehicleId: cleanText(body.vehicleId, 80),
      lat,
      lng,
      accuracy,
      recordedAt: now,
      createdAt: now,
    };
  }

  if (collection === "pumps") {
    requireFields(body, ["name", "area"]);
    const fuelPrice = body.fuelPrice ? cleanNumber(body.fuelPrice, { min: 0, max: 100_000 }) : null;
    const lat = body.lat ? cleanNumber(body.lat, { min: -90, max: 90 }) : null;
    const lng = body.lng ? cleanNumber(body.lng, { min: -180, max: 180 }) : null;
    if ((body.lat && lat === null) || (body.lng && lng === null)) {
      throw Object.assign(new Error("Map coordinates are invalid."), { statusCode: 400 });
    }
    return {
      id: uid("pump"),
      ownerId: user.id,
      name: cleanText(body.name, 100),
      area: cleanText(body.area, 100),
      fuelPrice,
      phone: cleanText(body.phone, 30),
      lat,
      lng,
      createdAt: now,
    };
  }

  if (collection === "garages") {
    requireFields(body, ["name", "area"]);
    const lat = body.lat ? cleanNumber(body.lat, { min: -90, max: 90 }) : null;
    const lng = body.lng ? cleanNumber(body.lng, { min: -180, max: 180 }) : null;
    if ((body.lat && lat === null) || (body.lng && lng === null)) {
      throw Object.assign(new Error("Map coordinates are invalid."), { statusCode: 400 });
    }
    return {
      id: uid("garage"),
      ownerId: user.id,
      name: cleanText(body.name, 100),
      area: cleanText(body.area, 100),
      serviceType: cleanText(body.serviceType, 120),
      phone: cleanText(body.phone, 30),
      lat,
      lng,
      createdAt: now,
    };
  }

  throw Object.assign(new Error("Unsupported collection."), { statusCode: 404 });
}

function canDelete(collection, record, user, database) {
  if (user.role === "admin") return true;
  if (collection === "vehicles") return record.userId === user.id;
  if (collection === "pumps" || collection === "garages") return record.ownerId === user.id;
  const vehicle = database.vehicles.find((item) => item.id === record.vehicleId);
  return vehicle?.userId === user.id;
}

async function serveStatic(request, response, pathname) {
  const requestedPath = pathname === "/" ? "index.html" : pathname.replace(/^\//, "");
  let filePath = path.resolve(clientDirectory, requestedPath);
  if (filePath !== clientDirectory && !filePath.startsWith(`${clientDirectory}${path.sep}`)) return false;

  try {
    if (!(await stat(filePath)).isFile()) return false;
  } catch {
    if (path.extname(requestedPath)) return false;
    filePath = path.join(clientDirectory, "index.html");
    try {
      await stat(filePath);
    } catch {
      return false;
    }
  }

  const extension = path.extname(filePath);
  const contentTypes = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
  };
  response.writeHead(200, {
    "Content-Type": contentTypes[extension] || "application/octet-stream",
    "X-Content-Type-Options": "nosniff",
    "Content-Security-Policy": "default-src 'self'; img-src 'self' data: https://www.google.com; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'",
  });
  response.end(await readFile(filePath));
  return true;
}

async function handleRequest(request, response) {
  const headers = corsHeaders(request);
  if (request.method === "OPTIONS") {
    response.writeHead(204, headers);
    response.end();
    return;
  }

  const url = new URL(request.url, `http://${request.headers.host || `localhost:${port}`}`);
  const pathname = url.pathname;

  try {
    if (pathname === "/api/health" && request.method === "GET") {
      sendJson(response, 200, { status: "ok", service: "DriveCare Hub API" }, headers);
      return;
    }

    const database = await readDatabase();
    const now = Date.now();
    database.sessions = database.sessions.filter(
      (session) => new Date(session.expiresAt).getTime() > now,
    );

    if (pathname === "/api/auth/register" && request.method === "POST") {
      const body = await readJson(request);
      const name = cleanText(body.name, 80);
      const email = cleanText(body.email, 120).toLowerCase();
      const password = String(body.password || "");
      const role = cleanText(body.role, 20);
      if (!name || !validateEmail(email) || password.length < 8 || !validRoles.has(role)) {
        sendJson(response, 400, { message: "Use a valid name, email, role, and password of at least 8 characters." }, headers);
        return;
      }
      if (database.users.some((user) => user.email === email)) {
        sendJson(response, 409, { message: "An account already exists for this email." }, headers);
        return;
      }
      const passwordData = hashPassword(password);
      const user = {
        id: uid("user"),
        name,
        email,
        role,
        passwordHash: passwordData.hash,
        passwordSalt: passwordData.salt,
        createdAt: new Date().toISOString(),
      };
      const token = createToken();
      database.users.push(user);
      database.sessions.push({
        token,
        userId: user.id,
        expiresAt: new Date(Date.now() + sessionTtlMs).toISOString(),
      });
      await writeDatabase(database);
      sendJson(response, 201, { token, user: publicUser(user), data: visibleData(database, user) }, headers);
      return;
    }

    if (pathname === "/api/auth/login" && request.method === "POST") {
      const ip = request.socket.remoteAddress || "unknown";
      const attempts = loginAttempts.get(ip) || { count: 0, resetAt: Date.now() + 15 * 60 * 1000 };
      if (Date.now() > attempts.resetAt) {
        attempts.count = 0;
        attempts.resetAt = Date.now() + 15 * 60 * 1000;
      }
      if (attempts.count >= 10) {
        sendJson(response, 429, { message: "Too many login attempts. Try again later." }, headers);
        return;
      }
      const body = await readJson(request);
      const email = cleanText(body.email, 120).toLowerCase();
      const password = String(body.password || "");
      const user = database.users.find((item) => item.email === email);
      if (!user || !verifyPassword(password, user.passwordSalt, user.passwordHash)) {
        attempts.count += 1;
        loginAttempts.set(ip, attempts);
        sendJson(response, 401, { message: "Invalid email or password." }, headers);
        return;
      }
      loginAttempts.delete(ip);
      const token = createToken();
      database.sessions.push({
        token,
        userId: user.id,
        expiresAt: new Date(Date.now() + sessionTtlMs).toISOString(),
      });
      await writeDatabase(database);
      sendJson(response, 200, { token, user: publicUser(user), data: visibleData(database, user) }, headers);
      return;
    }

    const user = findAuthenticatedUser(database, request);
    if (pathname.startsWith("/api/") && !user) {
      sendJson(response, 401, { message: "Your session is invalid or expired." }, headers);
      return;
    }

    if (pathname === "/api/auth/session" && request.method === "GET") {
      sendJson(response, 200, { user: publicUser(user), data: visibleData(database, user) }, headers);
      return;
    }

    if (pathname === "/api/auth/logout" && request.method === "POST") {
      const token = getBearerToken(request);
      database.sessions = database.sessions.filter((session) => session.token !== token);
      await writeDatabase(database);
      sendJson(response, 200, { message: "Logged out." }, headers);
      return;
    }

    if (pathname === "/api/data" && request.method === "GET") {
      sendJson(response, 200, { data: visibleData(database, user) }, headers);
      return;
    }

    const collectionMatch = pathname.match(/^\/api\/(vehicles|fuelLogs|serviceRecords|insuranceRecords|locations|pumps|garages)$/);
    if (collectionMatch && request.method === "POST") {
      const collection = collectionMatch[1];
      const body = await readJson(request);
      const record = validateRecord(collection, body, user, database);
      if (collection === "vehicles" && database.vehicles.some((item) => item.plate === record.plate)) {
        sendJson(response, 409, { message: "A vehicle with this plate number already exists." }, headers);
        return;
      }
      database[collection].push(record);
      await writeDatabase(database);
      sendJson(response, 201, { record, data: visibleData(database, user) }, headers);
      return;
    }

    const deleteMatch = pathname.match(/^\/api\/(vehicles|fuelLogs|serviceRecords|insuranceRecords|locations|pumps|garages)\/([^/]+)$/);
    if (deleteMatch && request.method === "DELETE") {
      const [, collection, id] = deleteMatch;
      if (!collections.has(collection)) {
        sendJson(response, 404, { message: "Resource not found." }, headers);
        return;
      }
      const record = database[collection].find((item) => item.id === id);
      if (!record) {
        sendJson(response, 404, { message: "Record not found." }, headers);
        return;
      }
      if (!canDelete(collection, record, user, database)) {
        sendJson(response, 403, { message: "You cannot delete this record." }, headers);
        return;
      }
      if (collection === "vehicles") {
        for (const relatedCollection of ["fuelLogs", "serviceRecords", "insuranceRecords", "locations"]) {
          database[relatedCollection] = database[relatedCollection].filter((item) => item.vehicleId !== id);
        }
      }
      database[collection] = database[collection].filter((item) => item.id !== id);
      await writeDatabase(database);
      sendJson(response, 200, { message: "Record deleted.", data: visibleData(database, user) }, headers);
      return;
    }

    if (pathname.startsWith("/api/")) {
      sendJson(response, 404, { message: "API route not found." }, headers);
      return;
    }

    if (!(await serveStatic(request, response, pathname))) {
      sendJson(response, 404, { message: "Page not found." }, headers);
    }
  } catch (error) {
    console.error(error);
    sendJson(response, error.statusCode || 500, { message: error.statusCode ? error.message : "An unexpected server error occurred." }, headers);
  }
}

let mutationQueue = Promise.resolve();

function enqueueMutation(task) {
  const operation = mutationQueue.then(task, task);
  mutationQueue = operation.catch(() => {});
  return operation;
}

const server = createServer((request, response) => {
  const isMutation = request.url?.startsWith("/api/") && ["POST", "DELETE"].includes(request.method);
  if (isMutation) {
    enqueueMutation(() => handleRequest(request, response));
  } else {
    handleRequest(request, response);
  }
});

server.listen(port, () => {
  console.log(`DriveCare Hub server running at http://localhost:${port}`);
});
