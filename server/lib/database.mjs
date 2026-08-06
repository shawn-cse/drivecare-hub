import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { hashPassword } from "./auth.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultDataDirectory = path.resolve(__dirname, "../data");
const databaseFile = process.env.DATABASE_FILE
  ? path.resolve(process.env.DATABASE_FILE)
  : path.join(defaultDataDirectory, "database.json");
const dataDirectory = path.dirname(databaseFile);
const temporaryFile = `${databaseFile}.tmp`;

function initialDatabase() {
  const adminPassword = hashPassword("admin123");
  return {
    users: [
      {
        id: "admin-1",
        name: "Platform Administrator",
        email: "admin@drivecare.app",
        role: "admin",
        passwordHash: adminPassword.hash,
        passwordSalt: adminPassword.salt,
        createdAt: new Date().toISOString(),
      },
    ],
    sessions: [],
    vehicles: [],
    fuelLogs: [],
    serviceRecords: [],
    insuranceRecords: [],
    locations: [],
    pumps: [
      {
        id: "pump-1",
        ownerId: "admin-1",
        name: "DriveFuel Central",
        area: "Dhaka",
        fuelPrice: 128,
        phone: "+880 1700 000000",
        lat: 23.8103,
        lng: 90.4125,
        createdAt: new Date().toISOString(),
      },
    ],
    garages: [
      {
        id: "garage-1",
        ownerId: "admin-1",
        name: "DriveCare Auto Service",
        area: "Dhaka",
        serviceType: "Car and motorcycle servicing",
        phone: "+880 1800 000000",
        lat: 23.7806,
        lng: 90.2794,
        createdAt: new Date().toISOString(),
      },
    ],
  };
}

export async function readDatabase() {
  await mkdir(dataDirectory, { recursive: true });
  try {
    return JSON.parse(await readFile(databaseFile, "utf8"));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    const database = initialDatabase();
    await writeDatabase(database);
    return database;
  }
}

export async function writeDatabase(database) {
  await mkdir(dataDirectory, { recursive: true });
  await writeFile(temporaryFile, JSON.stringify(database, null, 2), "utf8");
  await rename(temporaryFile, databaseFile);
}

export function publicUser(user) {
  const { passwordHash: _passwordHash, passwordSalt: _passwordSalt, ...safeUser } = user;
  return safeUser;
}
