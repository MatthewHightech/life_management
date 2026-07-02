# Life Management

Private household app (tasks, finance, calendar). Monorepo: Next.js web + Express/GraphQL API + Postgres.

## First-time setup

1. Copy env and fill in Google OAuth + allowlist:

   ```bash
   cp .env.example .env
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Generate GraphQL types for the web app:

   ```bash
   npm run codegen
   ```

4. Start everything with Docker:

   ```bash
   docker compose up
   ```

5. Open **http://localhost:3000** and sign in.

| Service  | URL                   |
|----------|-----------------------|
| Web      | http://localhost:3000 |
| API      | http://localhost:4000 |
| Postgres | localhost:5432        |

---

## Daily dev

```bash
docker compose up
```

Code is volume-mounted; API and web hot-reload. Containers run `npm install` on start so new dependencies sync automatically.

---

## When you change things

### `packages/db/prisma/schema.prisma` (database models)

**Apply pending migrations** (after pulling new migration files, or when the DB is behind the schema):

```bash
docker compose exec api npm run db:migrate:deploy -w @life/db
```

Use this when Docker is already running and you need to run migrations without restarting containers — for example after `git pull` brings in new files under `packages/db/prisma/migrations/`. The API container also runs this on startup, so a fresh `docker compose up` applies migrations automatically; run the command above when the stack is already up.

**Create a new migration** during development (after editing `schema.prisma`):

```bash
npm run db:migrate -w @life/db
```

Postgres must be reachable (Docker stack running). This creates a migration file and applies it. Then commit the new folder under `packages/db/prisma/migrations/`.

**Regenerate Prisma client** (also runs on API container start):

```bash
npm run db:generate -w @life/db
```

Or restart the API container — it runs migrate deploy + generate on startup:

```bash
docker compose restart api
```

### GraphQL schema or resolvers (`packages/graphql/`)

No extra command for the API — it hot-reloads.

If you changed **types, fields, or enums** that the web app queries, regenerate frontend types:

```bash
npm run codegen
```

### Web GraphQL queries (`apps/web/src/graphql/operations/`)

After adding or editing a query/mutation:

```bash
npm run codegen
```

Codegen checks your operations against the schema. Invalid field names fail at generate time, not in the browser.

Import typed documents from `@/graphql` in components (not from `operations/` directly).

### New npm dependency

```bash
npm install <package> -w <workspace>
docker compose restart api web
```

---

## Useful commands

| Command | What it does |
|---------|----------------|
| `npm run codegen` | Print GraphQL schema + generate typed web client |
| `npm run schema:print` | Update `packages/graphql/schema.graphql` only |
| `npm run typecheck` | TypeScript check all workspaces |
| `npm test` | Unit tests |
| `docker compose exec api npm run db:migrate:deploy -w @life/db` | Apply pending DB migrations (stack already running) |
| `npm run db:migrate -w @life/db` | Create + apply a new migration from schema changes |
| `npm run db:studio` | Prisma Studio (DB browser) |

---

## Project layout

```
apps/api/          Express API, auth, GraphQL endpoint
apps/web/          Next.js frontend
packages/db/       Prisma schema + migrations
packages/graphql/  GraphQL schema + resolvers
packages/shared/   Shared utilities (dates, auth types)
```

---

## Production deploy

See [docs/deployment/oracle-vm.md](docs/deployment/oracle-vm.md).
