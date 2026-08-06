import { emptyData } from "./constants.js";

const DEMO_DATABASE_KEY = "drivecare-demo-database-v1";
const DEMO_USER_KEY = "drivecare-demo-current-user-v1";

const iso = (value) => `${value}T09:00:00.000Z`;

export const demoAdministrator = {
  id: "admin-1",
  name: "Shawn — Demo Administrator",
  email: "admin@drivecare.app",
  role: "admin",
  createdAt: iso("2026-07-01"),
};

function seedDatabase() {
  return {
    users: [
      demoAdministrator,
      {
        id: "user-owner-1",
        name: "Arafat Rahman",
        email: "arafat@example.com",
        role: "owner",
        createdAt: iso("2026-07-11"),
      },
      {
        id: "user-garage-1",
        name: "Nadia Karim",
        email: "nadia@example.com",
        role: "garage",
        createdAt: iso("2026-07-18"),
      },
    ],
    vehicles: [
      {
        id: "vehicle-1",
        userId: "admin-1",
        name: "Daily Corolla",
        type: "Car",
        plate: "DHAKA-METRO-GA-25-7788",
        brand: "Toyota",
        model: "Corolla Axio",
        year: 2022,
        fuelType: "Octane",
        odometer: 28940,
        createdAt: iso("2026-07-02"),
      },
      {
        id: "vehicle-2",
        userId: "admin-1",
        name: "City Commuter",
        type: "Motorcycle",
        plate: "DHAKA-METRO-LA-44-9021",
        brand: "Yamaha",
        model: "FZ-S V3",
        year: 2023,
        fuelType: "Petrol",
        odometer: 12880,
        createdAt: iso("2026-07-05"),
      },
      {
        id: "vehicle-3",
        userId: "admin-1",
        name: "Delivery Van",
        type: "Microbus",
        plate: "DHAKA-METRO-CHA-19-3250",
        brand: "Toyota",
        model: "Hiace",
        year: 2020,
        fuelType: "Diesel",
        odometer: 76420,
        createdAt: iso("2026-07-08"),
      },
    ],
    fuelLogs: [
      {
        id: "fuel-1",
        vehicleId: "vehicle-1",
        liters: 24,
        pricePerLiter: 131,
        totalCost: 3144,
        odometer: 28490,
        pumpName: "DriveFuel Central",
        date: "2026-07-10",
        createdAt: iso("2026-07-10"),
      },
      {
        id: "fuel-2",
        vehicleId: "vehicle-1",
        liters: 27,
        pricePerLiter: 131,
        totalCost: 3537,
        odometer: 28868,
        pumpName: "Green Road Filling Station",
        date: "2026-07-29",
        createdAt: iso("2026-07-29"),
      },
      {
        id: "fuel-3",
        vehicleId: "vehicle-2",
        liters: 8.5,
        pricePerLiter: 127,
        totalCost: 1079.5,
        odometer: 12610,
        pumpName: "DriveFuel Central",
        date: "2026-07-14",
        createdAt: iso("2026-07-14"),
      },
      {
        id: "fuel-4",
        vehicleId: "vehicle-2",
        liters: 9.2,
        pricePerLiter: 127,
        totalCost: 1168.4,
        odometer: 12904,
        pumpName: "Uttara Fuel Point",
        date: "2026-08-02",
        createdAt: iso("2026-08-02"),
      },
      {
        id: "fuel-5",
        vehicleId: "vehicle-3",
        liters: 43,
        pricePerLiter: 114,
        totalCost: 4902,
        odometer: 76380,
        pumpName: "Airport Road Filling Station",
        date: "2026-08-03",
        createdAt: iso("2026-08-03"),
      },
    ],
    serviceRecords: [
      {
        id: "service-1",
        vehicleId: "vehicle-1",
        garageName: "DriveCare Auto Service",
        serviceType: "Engine oil and filter replacement",
        serviceDate: "2026-07-17",
        nextServiceDate: "2026-10-17",
        cost: 6200,
        notes: "Used manufacturer-recommended synthetic oil.",
        createdAt: iso("2026-07-17"),
      },
      {
        id: "service-2",
        vehicleId: "vehicle-2",
        garageName: "MotoLab Dhaka",
        serviceType: "Brake and chain inspection",
        serviceDate: "2026-07-25",
        nextServiceDate: "2026-09-25",
        cost: 2100,
        notes: "Chain adjusted and rear brake pads checked.",
        createdAt: iso("2026-07-25"),
      },
      {
        id: "service-3",
        vehicleId: "vehicle-3",
        garageName: "Commercial Vehicle Care",
        serviceType: "Scheduled full service",
        serviceDate: "2026-06-18",
        nextServiceDate: "2026-08-18",
        cost: 14800,
        notes: "Inspect suspension at next visit.",
        createdAt: iso("2026-06-18"),
      },
    ],
    insuranceRecords: [
      {
        id: "insurance-1",
        vehicleId: "vehicle-1",
        provider: "Green Delta Insurance",
        policyNumber: "GD-DC-2026-7712",
        expiryDate: "2026-09-05",
        premium: 18400,
        createdAt: iso("2026-07-02"),
      },
      {
        id: "insurance-2",
        vehicleId: "vehicle-2",
        provider: "Pioneer Insurance",
        policyNumber: "PI-MC-2026-4421",
        expiryDate: "2027-01-14",
        premium: 7200,
        createdAt: iso("2026-07-05"),
      },
      {
        id: "insurance-3",
        vehicleId: "vehicle-3",
        provider: "Reliance Insurance",
        policyNumber: "RI-CV-2026-1910",
        expiryDate: "2026-08-21",
        premium: 32900,
        createdAt: iso("2026-07-08"),
      },
    ],
    locations: [
      {
        id: "location-1",
        vehicleId: "vehicle-1",
        lat: 23.780573,
        lng: 90.279239,
        accuracy: 18,
        recordedAt: iso("2026-08-04"),
        createdAt: iso("2026-08-04"),
      },
      {
        id: "location-2",
        vehicleId: "vehicle-3",
        lat: 23.851399,
        lng: 90.408875,
        accuracy: 24,
        recordedAt: iso("2026-08-05"),
        createdAt: iso("2026-08-05"),
      },
    ],
    pumps: [
      {
        id: "pump-1",
        ownerId: "admin-1",
        name: "DriveFuel Central",
        area: "Tejgaon, Dhaka",
        fuelPrice: 128,
        phone: "+880 1700 000000",
        lat: 23.7639,
        lng: 90.3922,
        createdAt: iso("2026-07-01"),
      },
      {
        id: "pump-2",
        ownerId: "admin-1",
        name: "Uttara Fuel Point",
        area: "Uttara, Dhaka",
        fuelPrice: 127,
        phone: "+880 1711 222333",
        lat: 23.8759,
        lng: 90.3795,
        createdAt: iso("2026-07-14"),
      },
    ],
    garages: [
      {
        id: "garage-1",
        ownerId: "admin-1",
        name: "DriveCare Auto Service",
        area: "Mirpur, Dhaka",
        serviceType: "Cars, motorcycles, and scheduled maintenance",
        phone: "+880 1800 000000",
        lat: 23.8067,
        lng: 90.3686,
        createdAt: iso("2026-07-01"),
      },
      {
        id: "garage-2",
        ownerId: "user-garage-1",
        name: "MotoLab Dhaka",
        area: "Dhanmondi, Dhaka",
        serviceType: "Motorcycle diagnostics and servicing",
        phone: "+880 1812 334455",
        lat: 23.7465,
        lng: 90.3760,
        createdAt: iso("2026-07-18"),
      },
    ],
  };
}

export function getDemoDatabase() {
  const saved = localStorage.getItem(DEMO_DATABASE_KEY);
  if (saved) {
    try {
      return { ...structuredClone(emptyData), ...JSON.parse(saved) };
    } catch {
      localStorage.removeItem(DEMO_DATABASE_KEY);
    }
  }
  const database = seedDatabase();
  saveDemoDatabase(database);
  return database;
}

export function saveDemoDatabase(database) {
  localStorage.setItem(DEMO_DATABASE_KEY, JSON.stringify(database));
}

export function getDemoUser() {
  const saved = localStorage.getItem(DEMO_USER_KEY);
  if (!saved) return demoAdministrator;
  try {
    return JSON.parse(saved);
  } catch {
    return demoAdministrator;
  }
}

export function saveDemoUser(user) {
  if (user) localStorage.setItem(DEMO_USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(DEMO_USER_KEY);
}

export function resetDemoDatabase() {
  const database = seedDatabase();
  saveDemoDatabase(database);
  saveDemoUser(demoAdministrator);
  return database;
}
