# DriveCare Hub Architecture

## Request flow

```text
Browser
  │
  ├── Static HTML, CSS, and JavaScript
  │
  └── Fetch API requests
          │
          ▼
Node.js HTTP Server
  │
  ├── CORS and security headers
  ├── Authentication and session verification
  ├── Role-based data filtering
  ├── Request validation
  ├── CRUD operations
  │
  ▼
Atomic JSON Database
```

## Frontend design

The frontend is divided into reusable rendering helpers and feature views. Each view returns HTML and a mount function that attaches only the event listeners needed for that screen. The main application owns session state, navigation, notices, and data refreshes.

User-provided values are escaped before being inserted into HTML. API communication is centralised in `client/src/api.js`.

## Backend design

The backend uses Node.js core modules only. It provides authentication, role-aware data access, validation, CRUD operations, static file delivery, and security headers.

Passwords are stored as PBKDF2-SHA512 hashes with per-user random salts. Session tokens are cryptographically random and expire automatically.

## Persistence

Database changes are written to a temporary file and then atomically renamed. This reduces the risk of leaving a partially written JSON document after an interrupted write.

For horizontal scaling, replace `server/lib/database.mjs` with a database adapter for PostgreSQL or another transactional database while preserving the API contracts.
