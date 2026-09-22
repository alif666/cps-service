codex resume 01a0c8d7-5512-7e12-a5fd-c4d178c51cf2

# CPS Service

Initial implementation uses TypeScript/Express with PostgreSQL as the database and Flyway as the schema migration owner. Docker Compose runs PostgreSQL, Flyway, and the API together.

## Local development

```bash
npm install
npm test
npm run build
docker compose up --build
```

The Compose setup runs PostgreSQL, Flyway migrations, a clearly marked development seed, and the API. The development login is `admin@cps.local` / `ChangeMe123!`; do not use this seed or password outside local development.

Import `postman/CPS-Service.postman_collection.json` into Postman for manual testing.

The first vertical slice exposes organization endpoints:

- `GET /health`
- `GET /api/v1/organizations`
- `POST /api/v1/organizations`
- `PATCH /api/v1/organizations/:id/status`

All organization and access-configuration endpoints require a bearer token with the appropriate server-side permission. Login is available at `POST /api/v1/auth/login`. DOA configuration is available under `/api/v1/doa-rules` with the `doa.manage` permission.

Access configuration endpoints are available under `/api/v1/access` for business units, departments, stores, roles, permissions, users, and user assignments.

The database migration includes the initial organization/access foundation tables for companies, business units, departments, stores, roles, permissions, users, and scoped user assignments. Additional endpoints and policy configuration will be added incrementally.
