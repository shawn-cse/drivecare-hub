# DriveCare Hub

**A secure, full-stack vehicle, fuel, mileage, maintenance, insurance, and location management platform.**

[![Node.js](https://img.shields.io/badge/Node.js-20.11%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES%20Modules-F7DF1E?logo=javascript&logoColor=111827)](https://developer.mozilla.org/docs/Web/JavaScript)
[![Tests](https://img.shields.io/badge/Automated%20Tests-Passing-16a34a)](#quality-assurance)
[![License](https://img.shields.io/badge/License-MIT-2563eb)](LICENSE)

## Project name

The project has been renamed from **VeloNexus** to **DriveCare Hub**.

The new name is easier to understand in real life:

- **Drive** clearly connects the product to vehicles and journeys.
- **Care** represents fuel, maintenance, insurance, and responsible ownership.
- **Hub** communicates that all vehicle records are managed in one place.

Recommended GitHub repository name:

```text
drivecare-hub
```

## Overview

DriveCare Hub gives vehicle owners, drivers, petrol pump owners, garage owners, and administrators one organised workspace for managing daily vehicle operations.

The rebuilt version includes a real Node.js backend, secure authentication, server-side role filtering, persistent JSON storage, a responsive user interface, input validation, record deletion, mileage calculation, insurance alerts, maintenance reminders, and automated tests.

## Main features

| Module | Capabilities |
|---|---|
| Authentication | Registration, login, logout, password hashing, token sessions, role selection, login rate limiting |
| Dashboard | Vehicle totals, fuel cost, average mileage, insurance alerts, recent fuel activity, upcoming services |
| Vehicle Registry | Add and delete cars, motorcycles, trucks, buses, microbuses, and other vehicles |
| Fuel & Mileage | Record fill-ups, validate odometer progression, calculate cost, calculate real-world mileage |
| Saved Locations | Capture browser geolocation snapshots, accuracy information, Google Maps links |
| Maintenance | Store garage, service type, date, cost, notes, next-service date, and overdue reminders |
| Insurance | Store providers, policy numbers, premiums, expiry dates, and 30-day alerts |
| Service Directory | Add public petrol pump and garage listings with phone numbers, prices, and map coordinates |
| Administration | View platform totals and safe user metadata without exposing password information |
| Data Integrity | Vehicle deletion automatically removes related fuel, maintenance, insurance, and location records |

## Supported roles

| Role | Access |
|---|---|
| Vehicle Owner | Personal vehicles and all related records |
| Driver | Assigned personal workspace and vehicle records |
| Petrol Pump Owner | Vehicle tools and petrol pump directory listings |
| Garage Owner | Vehicle tools and garage directory listings |
| Administrator | Platform-wide records, statistics, and registered users |

## Demo administrator

```text
Email: admin@drivecare.app
Password: admin123
```

> Change the demo password before using this application in a public or production environment.

## Technology stack

### Frontend

- Semantic HTML5
- Modern CSS3
- Responsive desktop, tablet, and mobile layouts
- Modular JavaScript ES modules
- Browser Geolocation API
- Fetch API
- Inline SVG icon system
- No frontend runtime dependencies

### Backend

- Node.js 20.11+
- Native Node.js HTTP server
- PBKDF2-SHA512 password hashing
- Cryptographically secure session tokens
- JSON file persistence with atomic writes
- Server-side validation and role-based access control
- Static frontend hosting

### Quality assurance

- Native Node.js test runner
- API integration tests
- Automated syntax checks for every JavaScript module
- Authentication and permission tests
- Validation and cascade-deletion tests

## Security improvements

The original project stored user passwords and application data directly in browser local storage. The rebuilt project fixes that architecture.

- Passwords are hashed with PBKDF2-SHA512 and a unique random salt.
- Plaintext passwords are never stored in the browser or returned by the API.
- Sessions use random 256-bit bearer tokens with expiry times.
- Private routes reject unauthenticated requests.
- Non-admin users only receive records they are allowed to access.
- Login attempts are rate limited by IP address.
- Request bodies have a maximum size.
- Inputs are trimmed, length-limited, type-checked, and validated.
- User-provided content is escaped before frontend rendering.
- Security headers include CSP, `X-Content-Type-Options`, `X-Frame-Options`, and `Referrer-Policy`.
- Database writes use a temporary file and atomic rename to reduce corruption risk.
- Mutating API requests are serialised to prevent overlapping JSON writes.

## Important fixes from the previous version

- Replaced the 1,486-line monolithic frontend component with organised modules.
- Added a real backend instead of browser-only local storage.
- Removed plaintext password storage.
- Removed unused Firebase and router dependencies.
- Removed duplicate `type="date"` attributes.
- Removed the duplicated geolocation error notification.
- Added proper numeric input types and backend validation.
- Prevented fuel logs from using a lower or equal odometer reading.
- Added record deletion and vehicle-related cascade cleanup.
- Added mobile navigation and responsive layouts.
- Standardised the font, spacing, colour system, cards, forms, and status states.
- Added safe role-based administration data.
- Added automated integration tests and a dependency-free lint process.

## Folder structure

```text
drivecare-hub/
├── client/
│   ├── assets/
│   │   ├── favicon.svg
│   │   └── styles.css
│   ├── src/
│   │   ├── views/
│   │   │   ├── admin.js
│   │   │   ├── auth.js
│   │   │   ├── dashboard.js
│   │   │   ├── directory.js
│   │   │   ├── fuel.js
│   │   │   ├── insurance.js
│   │   │   ├── service.js
│   │   │   ├── tracking.js
│   │   │   └── vehicles.js
│   │   ├── api.js
│   │   ├── components.js
│   │   ├── constants.js
│   │   ├── icons.js
│   │   ├── main.js
│   │   └── utils.js
│   └── index.html
├── docs/
│   └── ARCHITECTURE.md
├── scripts/
│   └── lint.mjs
├── server/
│   ├── data/
│   │   └── .gitkeep
│   ├── lib/
│   │   ├── auth.mjs
│   │   ├── database.mjs
│   │   └── http.mjs
│   └── index.mjs
├── tests/
│   └── server.test.mjs
├── .env.example
├── .gitignore
├── LICENSE
├── package-lock.json
├── package.json
└── README.md
```

## Local installation

### 1. Clone the repository

```bash
git clone https://github.com/shawn-cse/drivecare-hub.git
cd drivecare-hub
```

### 2. Confirm Node.js

```bash
node --version
```

Use Node.js **20.11 or newer**.

### 3. Install the project

The application has no third-party runtime dependencies, but this command verifies the package lock:

```bash
npm install
```

### 4. Start development mode

```bash
npm run dev
```

Open:

```text
http://localhost:4000
```

### 5. Start without watch mode

```bash
npm start
```

## Environment variables

Copy the example file when custom configuration is required:

```bash
cp .env.example .env
```

| Variable | Default | Description |
|---|---:|---|
| `PORT` | `4000` | HTTP server port |
| `APP_ORIGIN` | `http://localhost:5173` | Optional additional allowed development origin |
| `SESSION_TTL_HOURS` | `24` | Session token lifetime |
| `DATABASE_FILE` | `server/data/database.json` | Custom JSON database path |

Node.js does not automatically load `.env` files in this dependency-free configuration. Set variables in the terminal or hosting dashboard.

Linux/macOS example:

```bash
PORT=5000 SESSION_TTL_HOURS=12 npm start
```

Windows PowerShell example:

```powershell
$env:PORT=5000
$env:SESSION_TTL_HOURS=12
npm start
```

## Available scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the backend with Node.js watch mode |
| `npm start` | Start the production server |
| `npm run lint` | Syntax-check all frontend, backend, and script modules |
| `npm test` | Run API integration tests |
| `npm run check` | Run syntax checks and all tests |

## API summary

### Public routes

| Method | Route | Purpose |
|---|---|---|
| `GET` | `/api/health` | Service health check |
| `POST` | `/api/auth/register` | Create an account |
| `POST` | `/api/auth/login` | Sign in |

### Authenticated routes

| Method | Route | Purpose |
|---|---|---|
| `GET` | `/api/auth/session` | Restore the current session and workspace data |
| `POST` | `/api/auth/logout` | End the current session |
| `GET` | `/api/data` | Retrieve role-filtered application data |
| `POST` | `/api/vehicles` | Add a vehicle |
| `POST` | `/api/fuelLogs` | Add a fuel record |
| `POST` | `/api/serviceRecords` | Add a maintenance record |
| `POST` | `/api/insuranceRecords` | Add an insurance policy |
| `POST` | `/api/locations` | Save a location snapshot |
| `POST` | `/api/pumps` | Add a petrol pump listing |
| `POST` | `/api/garages` | Add a garage listing |
| `DELETE` | `/api/:collection/:id` | Delete an authorised record |

## Mileage calculation

Mileage is calculated when at least two fuel records exist for the same vehicle.

```text
Distance travelled = Current odometer - Previous odometer
Mileage = Distance travelled / Current fuel quantity
```

Example:

```text
Previous odometer: 10,000 km
Current odometer: 10,270 km
Fuel quantity: 18 L
Distance travelled: 270 km
Mileage: 270 / 18 = 15 km/L
```

## Data storage

The application creates this file automatically on first launch:

```text
server/data/database.json
```

The database file is excluded from Git to protect user data.

The JSON database is appropriate for a portfolio project, local use, demonstrations, and a single small server instance. For a production system with multiple server instances or substantial traffic, migrate the database layer to PostgreSQL, MySQL, or another managed database.

## Deployment guidance

Because the backend writes to a local JSON file, deploy it to a platform with persistent disk storage, such as:

- A VPS
- Railway with a persistent volume
- Render with a persistent disk
- Fly.io with a mounted volume
- Docker on a server with a mounted data directory

Do not rely on ephemeral serverless file systems for permanent data. When deploying, set a persistent `DATABASE_FILE` path and replace the demo administrator credentials.

## Quality assurance

The following checks were completed successfully:

```text
Source modules checked: 19
Automated tests: 6 passed
Failed tests: 0
```

Test coverage includes:

- Health endpoint and frontend delivery
- Administrator authentication
- Safe user response fields
- Vehicle creation
- Fuel cost calculation
- Invalid odometer rejection
- User registration
- Role-filtered data
- Cross-user deletion rejection
- Vehicle cascade deletion
- Unauthenticated API rejection

Run the complete verification again with:

```bash
npm run check
```

## Migration note

Data stored by the previous browser-only VeloNexus version is not automatically imported because that version used a different and insecure local-storage structure. Start with a clean DriveCare Hub database or create a dedicated migration script after reviewing the old browser data.

## Author

**Shawn**

- GitHub: [shawn-cse](https://github.com/shawn-cse)
- Email: [shawnazd@gmail.com](mailto:shawnazd@gmail.com)

## License

This project is licensed under the [MIT License](LICENSE).
