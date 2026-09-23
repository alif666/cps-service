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

Permissions are assigned to roles, not directly to users. The login response and JWT include the user's active, scoped roles plus the effective permissions inherited from those roles. Authorization checks use permissions; roles are retained for identity, scope, and auditing.

Access configuration endpoints are available under `/api/v1/access` for business units, departments, stores, roles, permissions, users, and user assignments.

The database migration includes the initial organization/access foundation tables for companies, business units, departments, stores, roles, permissions, users, and scoped user assignments. Additional endpoints and policy configuration will be added incrementally.

### PROTOTYPE DEPLOYMENT
In Vercel:

1. Select Add New → Project.
2. Import the cps-service repository.
3. Use the default project root.
4. Framework: Express/Other, if Vercel asks.
5. Build command:

npm run build

6. Install command:

npm ci

7. Do not configure Docker Compose.
8. Deploy once after setting the environment variables.

Vercel supports Express applications with zero configuration and deploys them as a single Function. citeturn0search3turn0search7

### 3. Create Neon PostgreSQL

From the Vercel dashboard:

1. Open Storage or Marketplace.
2. Choose Neon.
3. Create a free database.
4. Connect it to the cps-service Vercel project.
5. Ensure DATABASE_URL is available in the Production environment.

Alternatively, use:

vercel integration add neon

Vercel will provision the resource and inject environment variables when connected to the project. citeturn2search5

### 4. Run Flyway migrations

Vercel will not automatically run the Flyway Docker container. Run the existing migrations once against the Neon database.

Use the Neon PostgreSQL connection details with Flyway:

DATABASE_URL → Neon connection string

The migrations are located in:

cps-service/db/migrations

You can run them using Flyway locally or a temporary Flyway Docker command. Do not run the development seed in production.

Verify that the following tables exist:

companies
business_units
departments
stores
roles
permissions
users
user_assignments
role_permissions
doa_rules
audit_logs

### 5. Configure service environment variables

In the Vercel service project, add these under Production:

DATABASE_URL=<Neon pooled PostgreSQL connection string>
JWT_SECRET=<long random secret>
NODE_ENV=production

Generate a secret with:

[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }))

Do not commit these values to GitHub.

After saving the variables, redeploy the service.

Test:

https://your-service.vercel.app/health

Expected response:

{
"status": "ok"
}

### 6. Create the Vercel client project

In Vercel:

1. Select Add New → Project.
2. Import the cps-client repository.
3. Framework should be detected as Next.js.
4. Use:

npm ci

as the install command.

5. Use:

npm run build

as the build command.

6. Add this Production environment variable:

CPS_API_URL=https://your-service.vercel.app

The client already uses Next.js route handlers as a backend-for-frontend, so the browser does not directly receive the service JWT.

Deploy the client and open its Vercel URL.

## Testing after deployment

Test in this order:

1. Open /health on the service.
2. Open the client login page.
3. Log in with the production admin account.
4. Open Organizations.
5. Open Access → Users.
6. Open Access → Roles.
7. Create a test permission.
8. Assign it to a test role.
9. Verify unauthorized users cannot access restricted screens.
10. Verify inactive users cannot create new transactions.

## Do not use Render PostgreSQL for the real system

Render can host the Express service for free, but the free web service sleeps after 15 minutes of inactivity and takes roughly a minute to wake up. Its free PostgreSQL expires after 30 days. citeturn0search0turn0search6

Therefore:

- Vercel: client and service
- Neon: PostgreSQL
- Flyway: run migrations manually or through CI
- Later: paid database with backups before production

This setup is suitable for development, demonstration, and early UAT. It should not yet be treated as production-ready because backups, monitoring, secure admin bootstrap, and support requirements are not finalized.