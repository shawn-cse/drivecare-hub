# DriveCare Hub Architecture

## Two operating modes

```text
GitHub Pages
Browser demo adapter
  │
  ├── Static HTML, CSS, and JavaScript
  ├── Sample records
  └── Browser localStorage

Full-stack deployment
Browser frontend
  │
  └── Fetch API
          │
          ▼
Node.js HTTP server
  │
  ├── Security headers and CORS
  ├── Authentication and sessions
  ├── Role-based data filtering
  ├── Validation and CRUD operations
  │
  ▼
Atomic JSON database
```

## Frontend design

The frontend is divided into reusable rendering helpers and feature views. Each view returns HTML and a mount function that attaches only the event listeners needed for that screen. The main application manages session state, navigation, notices, and data updates.

`client/src/api.js` selects the correct data layer:

- A real HTTP API for local or hosted full-stack use.
- A browser-only demo adapter on GitHub Pages or when `?demo=1` is present.

Sample demo records are stored in `client/src/demo-data.js`.

User-provided values are escaped before being inserted into HTML.

## Backend design

The backend uses Node.js core modules only. It provides authentication, role-aware data access, validation, CRUD operations, static file delivery, and security headers.

Passwords are stored as PBKDF2-SHA512 hashes with per-user random salts. Session tokens are cryptographically random and expire automatically.

## Persistence

Database changes are written to a temporary file and then atomically renamed. This reduces the risk of leaving a partially written JSON document after an interrupted write.

For horizontal scaling, replace `server/lib/database.mjs` with an adapter for PostgreSQL or another transactional database while preserving the API contracts.
