export const navigationItems = [
  { id: "dashboard", label: "Dashboard", description: "Overview and important alerts", icon: "dashboard" },
  { id: "vehicles", label: "Vehicles", description: "Manage registered vehicles", icon: "car" },
  { id: "fuel", label: "Fuel & Mileage", description: "Track fill-ups and efficiency", icon: "fuel" },
  { id: "tracking", label: "Locations", description: "Save and review vehicle locations", icon: "location" },
  { id: "service", label: "Maintenance", description: "Service history and reminders", icon: "service" },
  { id: "insurance", label: "Insurance", description: "Policies and expiry alerts", icon: "shield" },
  { id: "directory", label: "Service Directory", description: "Find pumps and garages", icon: "directory" },
  { id: "admin", label: "Administration", description: "Platform users and statistics", icon: "users", adminOnly: true },
];

export const roleLabels = {
  owner: "Vehicle Owner",
  driver: "Driver",
  pump: "Petrol Pump Owner",
  garage: "Garage Owner",
  admin: "Administrator",
};

export const vehicleTypes = ["Car", "Motorcycle", "Truck", "Bus", "Microbus", "Other"];
export const fuelTypes = ["Petrol", "Diesel", "Octane", "CNG", "Hybrid", "Electric"];

export const emptyData = {
  users: [],
  vehicles: [],
  fuelLogs: [],
  serviceRecords: [],
  insuranceRecords: [],
  locations: [],
  pumps: [],
  garages: [],
};
