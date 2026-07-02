# Life Management Suite — Requirements

> **Status:** Living document · **Last updated:** 2026-07-02  
> **Audience:** Project owner, future contributors, and LLM coding agents  
> **Purpose:** Single source of truth for what this product is, what it must do, and what it must not do.  
> **UI spec:** [`docs/design/DESIGN.md`](design/DESIGN.md)

---

## How to use this document (LLM agents)

1. **Read this entire file** before proposing architecture, writing code, or scoping a feature.
2. **Requirement IDs** (`REQ-*`, `NFR-*`, `CON-*`) are stable references — cite them in PRs and design notes.
3. **Priority labels:** `P0` = MVP blocker · `P1` = MVP desired · `P2` = post-MVP · `P3` = future/optional.
4. **Do not expand scope** beyond what is listed here unless the owner updates this file first.
5. **Open Questions** (§12) — all resolved; **Deferred items** (§9.3) still apply until a feature needs them.
6. When implementing, prefer **deep modules** with simple interfaces; optimize for the solo maintainer and agent-testability.

---

## 1. Vision & goals

### 1.1 Problem statement

The household currently relies on fragmented tools (Notion, spreadsheets, and others) that:

- Scatter data across multiple products with no single view.
- Lack full visibility for all family members.
- Maintain conflicting sources of truth.
- Cannot be extended with custom features the family needs.

**REQ-VISION-01 (P0):** The suite must centralize household data so tasks, finances, calendar, and future modules can share one backend and grow together.

**REQ-VISION-02 (P0):** The primary advantage over Notion/spreadsheets is the ability to **add purpose-built features** (not generic docs/tables).

### 1.2 Product positioning

| Dimension | Decision |
|-----------|----------|
| Primary users | Owner, spouse, and household members (family-only) |
| Productization | Private family tool for now; **small chance** of becoming a product later — do not over-engineer multi-tenancy yet, but avoid hard-coding single-household assumptions that would make expansion impossible |
| Tools replaced | Eventually replace **most** current tools (Notion, spreadsheets, task apps, etc.) |
| Tools kept | **Google Calendar** (source of truth for events) · **Family banking app** (source of truth for account balances) |
| Development pace | Hobby pace — ship iteratively, avoid over-building |

### 1.3 Primary pain points (ranked)

1. Scattered data across tools.
2. Incomplete visibility within the family.
3. Multiple conflicting sources of truth.
4. Off-the-shelf products missing desired features.

### 1.4 Success criteria

Both adults use task + budget views, have calendar integrated.

### 1.5 Failure modes to avoid

| Risk | Mitigation direction |
|------|---------------------|
| Security breach (financial + family data) | Google OAuth only, strong session hygiene, HTTPS, conservative scope |
| Never shipping due to scope creep | Strict phased roadmap (§5); MVP is Tasks + Finance + Calendar only |
| Building too much before validation | MVP-lite meal planning only; defer home inventory, family module, bank sync |

---

## 2. Stakeholders & users

### 2.1 User model

**REQ-USER-01 (P0):** Each person signs in with their **own Google account** (Gmail). Google OAuth is the **only** authentication method.

**REQ-USER-02 (P0):** Users are linked to exactly **one household** per family (no multi-household membership for now).

**REQ-USER-03 (P0):** Access is **allowlist-based** — only Google accounts explicitly permitted by the admin may sign in. Same flow for all adults (owner and spouse).

**REQ-USER-04 (P1):** Household membership is managed **manually by the admin** (owner) for now — no self-serve invite flow in MVP.

**REQ-USER-05 (P2):** Architecture should **allow** child/teen accounts and granular permissions later, but **no child accounts in MVP**.

**REQ-USER-06 (P0):** The Google account **allowlist** is managed via **environment variable or config file** for now — no admin UI required.

### 2.2 Visibility & permissions (MVP)

**REQ-PERM-01 (P0):** All household data is **fully transparent** to all household members in MVP — no per-module or per-item privacy rules yet.

**REQ-PERM-02 (P0):** Financial data is **fully shared** between adults in the household.

**REQ-PERM-03 (P2):** Custom permission rules (roles, per-item visibility, module-level access) are a **future** requirement — design data models without painting into a corner.

---

## 3. Scope

### 3.1 In scope (by phase)

See §5 Phased Roadmap for priorities.

| Module | Summary |
|--------|---------|
| **Tasks** | Full-featured task management for household |
| **Finance** | Manual budget/spend tracking mirroring real-world spending |
| **Calendar** | Google Calendar aggregation + two-way sync |
| **Meal planning** | MVP-lite meal plans + grocery lists (alongside core trio) |
| **Receipt management** | Household receipt file storage with shared folder organization |
| **Home inventory** | Desired, post-MVP |
| **Auth & household** | Google OAuth, allowlist, household grouping |

### 3.2 Explicitly out of scope (unless this doc is updated)

- Investment trading, tax filing, payroll.
- Non-Google calendar providers (Apple, Outlook).
- End-to-end encryption.
- MFA / TOTP / hardware keys (for now).
- User-defined custom fields or custom entity types.
- Global search across all entities.
- Data export / portability (not required).
- Onboarding flows, weekly review rituals, GTD workflows.
- Dark mode, accessibility-specific requirements.
- Real-time collaborative editing (refresh-on-load is sufficient).
- Offline-first operation (nice-to-have later only).
- Bank/payment initiation — future bank sync is **read-only** only.
- Native mobile apps in MVP (React Native is post-MVP).
- Audit trail / change history.
- Custom account recovery flows (Google handles account recovery).

### 3.3 Integrations

| Integration | Role | Priority |
|-------------|------|----------|
| Google OAuth | Authentication | P0 |
| Google Calendar | Event source of truth; read + write + multi-calendar aggregation | P0 |
| Family banking app | External source of truth for balances; **not integrated** in MVP | N/A |
| Plaid / bank sync | Read-only transaction import | P3 (much later) |
| Google Drive | Weekly database backup storage | P1 |
| Web Push | Per-task reminders (browser push notifications) | P0 |

---

## 4. Functional requirements by module

### 4.1 Application shell

**REQ-SHELL-01 (P0):** Default home screen (`/`) opens **Tasks → Kanban** view. Visual and navigation spec: [`docs/design/DESIGN.md`](design/DESIGN.md).

**REQ-SHELL-02 (P1):** Responsive web UI usable on phone, tablet, and desktop with equal priority.

**REQ-SHELL-03 (P0):** Primary navigation is **module-based** in a collapsible sidebar: Tasks · Finance · Calendar · Meal Planning · **Receipts**. Finance and Calendar may be disabled placeholders until their modules ship. Receipts is a **standalone module** (not nested under Finance). Task-specific views (Kanban, List, etc.) live **inside** the Tasks module, not as top-level sidebar items.

> **Rollout note:** REQ-TASK-10 (Today), REQ-TASK-11 (task calendar), and REQ-TASK-13 (by person) remain P0 for Phase 1 but ship **after** the initial Kanban + List UI pass. See [`docs/design/DESIGN.md`](design/DESIGN.md) §9.

---

### 4.2 Tasks & task management

#### 4.2.1 Task capabilities

**REQ-TASK-01 (P0):** Support **personal** and **shared/household** tasks.

**REQ-TASK-02 (P0):** Support **recurring** tasks (e.g., chores, routines).

**REQ-TASK-03 (P0):** Support **projects/lists** to group related tasks.

**REQ-TASK-04 (P0):** Support **dependencies** between tasks (blocked-by / blocks).

**REQ-TASK-05 (P0):** Tasks support **one or more assignees**, **due dates**, **priorities**, and **subtasks**.

**REQ-TASK-06 (P0):** Task **status** values: `BACKLOG` · `TODO` · `IN_PROGRESS` · `WAITING` · `DONE`. Kanban board uses the first four as columns; `DONE` is a **collapsible** column (hidden by default).

**REQ-TASK-07 (P0):** **Kanban drag-and-drop** — moving a card between columns updates task status.

#### 4.2.2 Task views

**REQ-TASK-10 (P0):** **Today / inbox** view. *(Initial UI pass: deferred — see DESIGN.md §9.)*

**REQ-TASK-11 (P0):** **Calendar** view (tasks grouped by due date; not Google Calendar). *(Initial UI pass: deferred.)*

**REQ-TASK-12 (P0):** **Kanban** view — default Tasks landing. Drag-and-drop between status columns (REQ-TASK-07).

**REQ-TASK-13 (P0):** **By person** view (filter/group by assignee). *(Initial UI pass: deferred.)*

**REQ-TASK-14 (P0):** **List** view — table with columns for task name, status, priority, assignee(s), and due date. Toggle with Kanban inside Tasks module.

**REQ-TASK-15 (P1):** Task list/kanban **filters** (assignee, priority, and extended filters). *(Deferred from initial UI pass.)*

#### 4.2.3 Task notifications

**REQ-TASK-20 (P0):** **Per-task** reminders via **web push** (browser push notifications).

#### 4.2.4 Deferred task features

| Feature | Priority | Notes |
|---------|----------|-------|
| Cross-entity links (task ↔ bill ↔ calendar event) | P2 | Maybe later |
| Task category labels / colored row accents on list view | P2 | Defer — use projects later; see DESIGN.md |
| Quick capture (voice, widget, email-in, share sheet) | P2 | Maybe later |
| GTD workflows (contexts, someday/maybe, weekly review) | P3 | Too complex for now |

---

### 4.3 Finance & budgeting

#### 4.3.1 Philosophy

The **family banking app remains the source of truth** for account balances and official transactions. This suite provides a **manual mirror** for budgeting, categorization, and household visibility — not a replacement for the bank app in MVP.

**REQ-FIN-01 (P0):** Manual **expense** and **income** entry.

**REQ-FIN-02 (P0):** **Budget categories** with monthly **spending limits**.

**REQ-FIN-03 (P0):** **Recurring bills/subscriptions** tracker.

**REQ-FIN-04 (P0):** **Reports** — spending by category, trends over time (scope at implementation).

**REQ-FIN-05 (P0):** Budget period follows the **calendar month**.

**REQ-FIN-06 (P0):** **Joint household budget** — shared view for all adults.

#### 4.3.2 Explicitly not in MVP finance scope

- Financial **account entities** (checking, savings, credit card records as first-class objects).
- Bank/credit card **sync** (Plaid or similar).
- Investment, loan, or net-worth tracking.
- Split transactions, multi-currency, tax tagging.
- Receipt storage (see **§4.7 Receipt management** — separate module, not finance attachments in MVP).

#### 4.3.3 Future finance

**REQ-FIN-20 (P3):** Read-only bank transaction import (e.g., Plaid) — assess security and implementation years from now.

---

### 4.4 Calendar (Google Calendar)

**REQ-CAL-01 (P0):** **Google Calendar is the source of truth** for events. This app reads from and writes to Google — not a parallel event store as primary.

**REQ-CAL-02 (P0):** **Aggregate** multiple calendars: owner, spouse, shared family, and future kids' calendars.

**REQ-CAL-03 (P0):** **Two-way sync** — create and edit events in the app; changes propagate to Google.

**REQ-CAL-04 (P0):** **Conflict resolution:** last-write-wins is acceptable.

**REQ-CAL-05 (P3):** No Apple Calendar, Outlook, or other providers.

---

### 4.5 Meal planning & grocery (Phase 1b)

**REQ-MEAL-01 (P1):** **Weekly meal plan grid** — Sunday through Saturday, three optional slots per day (**breakfast**, **lunch**, **dinner**). The grid shows **day names only** (not calendar dates such as “March 12”). Slots may be empty. **One meal per slot** when filled; assigning to an occupied slot **replaces** the existing meal.

**REQ-MEAL-02 (P1):** Assign meals to slots via **drag-and-drop** from the household recipe library onto a slot.

**REQ-MEAL-03 (P1):** Household-shared **recipe library** (CRUD). A recipe includes: **name**, **ingredients** (each with name; quantity and unit optional), **instructions**, and **servings** (stored for display; **does not scale grocery in v1** — schema should allow serving-based scaling later). **Create and edit** open a **modal** (reuse shared `Modal` component). **Delete** removes the recipe and **clears any week slots** that referenced it. Recipes persist across weeks. Recipes may be organized in **nested colored folders** (see REQ-FOLDER-01 … REQ-FOLDER-05).

**REQ-MEAL-04 (P1):** **Week rollover:** all planned slot assignments **auto-clear at 00:00 each Sunday** (**Pacific Time**, `America/Los_Angeles`) via a **server cron job**. The recipe library and grocery list are **not** auto-cleared on rollover.

**REQ-MEAL-05 (P1):** **Grocery list** for the active planning week:
- Auto-generated from ingredients of meals assigned to the current week grid.
- **Merge lines by ingredient name** (case-insensitive). Same name + same unit → sum quantities into one string. Same name + **different units** → **one row** with **multiple quantity strings** (e.g. `2 cups · 500 g`).
- **Manual** add, edit, delete items.
- Each row has a **Bought** checkmark (strikethrough when checked). Checked state persists until the user removes those rows.
- **Remove bought items** button deletes all checked rows (auto-generated and manual). List is **not** wiped on Sunday rollover.
- Auto-generated rows refresh when week grid assignments change; manual rows are preserved where possible (implementation may re-merge after grid changes).

**REQ-MEAL-06 (P1):** **Page layout** (desktop): recipe library at the **top**, weekly grid in the **middle**, grocery list **below** — all within the shared module page shell (`ModulePageLayout`).

**REQ-MEAL-07 (P2):** **Mobile layout** — same three sections stacked vertically; week grid may scroll horizontally on narrow viewports.

**REQ-MEAL-08 (P2):** **Calendar integration** — meal plans may reference calendar events in a later pass; **Google Calendar remains the event source of truth** (see REQ-CAL-01).

> Phase 1b is **MVP-lite**: full recipes and drag-to-plan, not a meal-kit replacement. Defer pantry inventory (REQ-HOME-01), nutrition, meal prep timers, and multi-week history until requirements are updated.

---

### 4.6 Home inventory (post-MVP)

**REQ-HOME-01 (P2):** Track household inventory (pantry, supplies, etc.). Detailed fields and UX deferred until after core trio is stable.

---

### 4.7 Receipt management (Phase 1c)

**REQ-RCPT-01 (P1):** **Standalone Receipts module** at `/receipts` with its own top-level sidebar nav item (not under Finance).

**REQ-RCPT-02 (P1):** **Household-shared** receipt files — all household members can view, upload, organize, rename, and delete receipts (same visibility model as recipes and tasks; REQ-PERM-01).

**REQ-RCPT-03 (P1):** Upload **images** and **PDFs** via **file picker** and **drag-and-drop** onto a dedicated upload area on the Receipts page.

**REQ-RCPT-04 (P1):** **Max file size 10 MB** per upload. Reject larger files with a clear error. Expected volume ~**50 receipts/month** per household (inform capacity planning, not a hard quota in v1).

**REQ-RCPT-05 (P1):** **In-app preview** — image thumbnails and in-browser preview; PDFs viewable in-app (implementation may use embedded viewer or open-in-tab from authenticated URL).

**REQ-RCPT-06 (P1):** **Rename** and **delete** receipts in v1.

**REQ-RCPT-07 (P1):** Organize receipts in the **shared folder system** (REQ-FOLDER-01 … REQ-FOLDER-05) with a **separate folder tree** for receipts (not shared with meal recipes).

**REQ-RCPT-08 (P2):** **No metadata** in v1 — no store, date, amount, tags, or search. Filename + folder location only. Schema may leave room for finance linking later without implementing it.

**REQ-RCPT-09 (P2):** **No search** in v1.

#### 4.7.1 File storage (decided)

**REQ-RCPT-10 (P1):** Receipt **file bytes** stored on **local disk** on the API host via a **Docker volume** (Option A). Postgres stores **metadata only** (`fileName`, `mimeType`, `byteSize`, `storageKey`, `folderId`, `householdId`, timestamps).

**REQ-RCPT-11 (P1):** Access files through the **API** with household auth checks — no public unauthenticated URLs. Implementation uses a **`FileStorage` abstraction** (`put`, `get`, `delete`) so object storage (S3/R2) can replace local disk later without changing receipt/folder domain logic.

**REQ-RCPT-12 (P1):** Allowed MIME types for v1: **JPEG, PNG, WebP, HEIC/HEIF** (if feasible on stack), and **application/pdf**. Reject other types at upload.

**REQ-RCPT-13 (P2):** Upload volume backup is **operator responsibility** — include uploads volume in VM backup strategy alongside Postgres (document in deploy guide when implemented).

#### 4.7.2 Explicitly not in v1 receipts scope

- OCR, auto-extraction of amount/vendor/date.
- Linking receipts to finance transactions or categories.
- Full-text search.
- Tags, notes, or custom metadata fields.
- Email-in or mobile camera capture (browser file picker + drag-drop only).
- Sharing receipts outside the household.

---

### 4.8 Shared folder system (cross-module)

Folders are a **shared platform capability** reused by Meal Planning (recipes) and Receipt Management (files). **Do not duplicate** folder UI or GraphQL per module.

**REQ-FOLDER-01 (P1):** **Generic `Folder` model** scoped by `householdId` and **`namespace`** enum (e.g. `MEALS`, `RECEIPTS`). Supports **nested hierarchy** via optional `parentId`. Each namespace has an **independent folder tree** per household.

**REQ-FOLDER-02 (P1):** Folder fields: **name**, **color** (six pastel options: Blush, Sky, Lavender, Lemon, Peach, Sage), optional **parentId**, `sortOrder`. Folder tiles show **name** and **item count** (direct children: subfolders + items in folder).

**REQ-FOLDER-03 (P1):** **Shared UI components** in `apps/web/src/components/folders/`: folder tile, breadcrumbs, create-folder modal (name + color swatches), folder browser shell. Module pages compose this shell with their own item rows and module-specific actions.

**REQ-FOLDER-04 (P1):** **Shared GraphQL** folder operations: list folders for namespace, `createFolder`, `moveItemToFolder` (or domain-specific move mutations that delegate to shared logic). Meal and receipt modules each expose their items alongside folders for the page query.

**REQ-FOLDER-05 (P1):** **Migrate** existing `RecipeFolder` / `Recipe.folderId` to the generic `Folder` model (`namespace = MEALS`) as part of receipt work — **one folder system**, not parallel implementations.

**REQ-FOLDER-06 (P1):** **Drag-and-drop into folders** within the module's library zone (reuse zone-aware DnD pattern from meal planning). Receipt files draggable into folders; meal recipes draggable into folders and onto meal slots (schedule zone unchanged).

---

### 4.9 Family / contacts / medical (deferred)

Not needed yet. Do not implement until this document is updated.

---

## 5. Phased roadmap

### Phase 0 — Foundation

- [x] Monorepo / project scaffold
- [x] `docker compose up` runs frontend + backend + Postgres locally
- [x] Google OAuth + allowlist auth
- [x] Household model (single household, link users)
- [x] GraphQL API skeleton (**Apollo Server**) + Apollo Client on frontend
- [x] Prisma schema + migrations against local Docker Postgres
- [x] Vitest + Playwright harness; CI runs test suite
- [ ] Deploy to **Oracle Cloud VM** (production Docker stack)

### Phase 1 — MVP (core trio)

| Module | Deliverables |
|--------|--------------|
| **Tasks** | CRUD, all fields, Kanban + List (first UI pass), then Today/calendar/by-person views; recurring, dependencies, per-task reminders; multi-assignee; extended statuses |
| **Finance** | Manual income/expense, categories + limits, recurring bills, monthly joint budget, basic reports |
| **Calendar** | Google OAuth for Calendar API, multi-calendar aggregation, two-way sync |

### Phase 1b — Meal planning

| Module | Deliverables |
|--------|--------------|
| **Meal planning** | Household recipe library · nested colored folders · Sun–Sat grid (breakfast/lunch/dinner) · drag-and-drop to slots · Sunday auto-clear · grocery list (auto + manual, merge by ingredient name) |

### Phase 1c — Receipt management

| Module | Deliverables |
|--------|--------------|
| **Shared folders** | Generic `Folder` model + shared UI/GraphQL · migrate meal `RecipeFolder` → `Folder` (`MEALS`) |
| **Receipts** | `/receipts` page + nav · upload (picker + drag-drop) · local volume storage + `FileStorage` abstraction · preview · rename/delete · organize in `RECEIPTS` folder tree |

### Phase 2 — Hardening & ops

- [ ] Weekly Postgres backup to Google Drive (unencrypted)
- [ ] Security review before trusting with real financial entries

### Phase 3 — Expansion

- [ ] Home inventory
- [ ] React Native mobile app (same GraphQL backend)
- [ ] Cross-entity linking (tasks ↔ bills ↔ events)
- [ ] Quick capture for tasks
- [ ] Custom permissions / child accounts
- [ ] Optional: migrate from Oracle VM to **Mac Mini** (same Docker stack)

### Phase 4 — Distant future

- [ ] Read-only bank sync
- [ ] Global search, history/versioning, advanced reporting
- [ ] Productization exploration (if ever)

---

## 6. Data model principles

**REQ-DATA-01 (P0):** Schema is **developer-evolvable** — the owner (solo dev) must be able to add features and change fields without a user-facing schema builder.

**REQ-DATA-02 (P0):** **No end-user custom fields** or custom entity types.

**REQ-DATA-03 (P1):** Use **categories** (not a generic tagging system) for classification in finance and related modules.

**REQ-DATA-04 (P2):** Entity relationships start simple; richer typed/graph relationships only when a concrete feature requires them.

**REQ-DATA-06 (P1):** **File metadata** lives in Postgres; **file bytes** live in object storage or local volume via `FileStorage` — never store large blobs in Postgres.

---

## 7. Non-functional requirements

### 7.1 Performance & UX

**NFR-PERF-01:** Refresh-on-load is acceptable — no WebSocket/real-time sync required.

**NFR-PERF-02:** Web app must be usable on mobile browsers at equal priority to desktop.

### 7.2 Reliability & backup

**NFR-REL-01 (P1):** **Weekly full database backup** to Google Drive. Encryption of backup files is **not required**.

**NFR-REL-02:** If primary hosting is unavailable, **no failover required** for now — app being down is acceptable.

**NFR-REL-03 (P2):** Receipt upload volume on local disk should be included in **operator backup** planning (~50 files/month × 10 MB max — low volume, but persistent Docker volume must survive redeploys).

### 7.3 Maintainability

**NFR-MAINT-01:** Target **~2 hours/week** ops burden after initial setup is complete.

**NFR-MAINT-02:** Dependency updates applied on a **moderate** cadence — neither bleeding-edge nor neglected.

**NFR-MAINT-03:** No uptime monitoring or 2am alerting required.

### 7.4 Testability (agent-friendly)

**NFR-TEST-01 (P0):** **Automated tests for all major features** so LLM agents can run the suite and detect regressions.

**NFR-TEST-02 (P0):** Test stack: **Vitest** (unit/integration) + **Playwright** (E2E).

**NFR-TEST-03 (P1):** Tests are a merge gate for feature work — new major features ship with tests.

### 7.5 Portability

**NFR-PORT-01:** Data export not required.

**NFR-PORT-02:** Architecture uses Docker Compose for production — portable from **Oracle VM** to **Mac Mini** without rewriting application logic.

---

## 8. Security & privacy

### 8.1 Authentication & sessions

**SEC-AUTH-01 (P0):** Google OAuth **only** — users must sign in with an allowed Gmail/Google account.

**SEC-AUTH-02 (P0):** No MFA in initial releases; reassess when finance module holds sensitive history.

**SEC-AUTH-03 (P0):** Session duration: remain signed in for up to **90 days** on trusted devices.

**SEC-AUTH-04:** No custom account recovery flow — users rely on **Google's account recovery** only.

### 8.2 Transport & storage

**SEC-TRANSPORT-01 (P0):** HTTPS for all production traffic via **Caddy** reverse proxy with automatic TLS (Let's Encrypt).

**SEC-STORAGE-01 (P0):** Encryption in transit required; **at-rest** encryption follows Postgres/hosting provider defaults.

**SEC-STORAGE-02:** End-to-end encryption is **explicitly not required** (overkill for this use case).

### 8.3 Exposure model

**SEC-EXPOSE-01 (P0):** Application exposed at a **public URL** with strong authentication (not VPN-only).

**SEC-EXPOSE-02 (P2):** Mac Mini homelab may use VPN/tunnel (Tailscale, Cloudflare Tunnel) — optional migration from Oracle VM.

### 8.4 Secrets

**SEC-SECRET-01 (P0):** API keys and credentials via **environment variables** (local `.env`, `.env.production` on VM).

### 8.5 Sensitive data

**SEC-DATA-01:** Financial entries and household data are sensitive — apply least-privilege DB access and parameterized queries.

**SEC-DATA-03 (P1):** Uploaded receipt files are **household-scoped** — API must verify household membership on every download/delete. Validate MIME type and size server-side; do not trust client-only checks.

---

## 9. Technical architecture

### 9.0 Monorepo layout

```
life_management/
├── apps/
│   ├── api/          # Standalone GraphQL + auth server (port 4000)
│   └── web/          # Next.js frontend only (port 3000)
├── packages/
│   ├── db/           # Prisma schema, migrations, client
│   ├── graphql/      # GraphQL schema, resolvers, Apollo server factory
│   └── shared/       # Shared types and utilities (allowlist, auth types)
```

**CON-ARCH-04:** `apps/api` is the single backend for web and future React Native. `apps/web` is a GraphQL client only.

### 9.1 Stack (decided)

| Layer | Choice | Notes |
|-------|--------|-------|
| Monorepo | **npm workspaces** | `apps/*` + `packages/*` |
| Web framework | **Next.js** (`apps/web`) | Frontend only — no embedded API routes |
| API server | **Express + Apollo Server** (`apps/api`) | Standalone process; GraphQL at `/graphql` |
| Language | **TypeScript** | |
| Database | **PostgreSQL** | Single primary data store |
| Postgres (production) | **Docker Postgres on Oracle VM** | Same Compose stack as API/web; not publicly exposed |
| Postgres (local dev) | **Docker Compose** | `docker-compose.yml`; same Prisma migrations as production |
| ORM | **Prisma** (`packages/db`) | Schema, migrations, and queries |
| API | **GraphQL** | Single API surface for web + future React Native |
| GraphQL server | **Apollo Server** | Runs in `apps/api` |
| GraphQL client | **Apollo Client** | Runs in `apps/web`; `Authorization: Bearer <jwt>` |
| Auth | **Google OAuth on API + JWT** | API `/auth/google`; 90-day JWT for clients |
| Mobile (future) | **React Native** | Same GraphQL API + JWT auth |
| Reverse proxy | **Caddy** | HTTPS termination; routes web + API subdomains |
| Local dev | **Docker Compose** | `docker compose up` → postgres + api + web (dev ports) |
| Production | **Docker Compose** | `docker-compose.prod.yml` on Oracle VM → postgres + api + web + caddy |
| Unit/integration tests | **Vitest** | |
| E2E tests | **Playwright** | |
| Notifications | **Web Push API** | Per-task reminders; service worker in Next.js app |

### 9.2 Hosting

| Environment | Platform | Notes |
|-------------|----------|-------|
| **Production (Phase 0–2)** | **Oracle Cloud Always Free VM** | Single VM runs Postgres + API + Web + Caddy via `docker-compose.prod.yml` |
| **Local development** | Docker Compose on dev machine | `docker-compose.yml` — hot reload, exposed ports 3000/4000/5432 |
| **Later (Phase 3+)** | **Mac Mini** (optional) | Same Docker production stack; migrate DNS + data volume or restore from backup |
| **Backup** | Google Drive (weekly) | `scripts/backup-db.sh`; optional `rclone` upload |

**CON-DEPLOY-01:** Production is **self-hosted Docker on Oracle VM** — not a managed PaaS (no Vercel/Render/Neon).

**CON-DEPLOY-02:** Postgres must **not** be exposed on a public port in production — only Caddy (80/443) is internet-facing.

**Deploy guide:** `docs/deployment/oracle-vm.md`

### 9.3 File storage (Phase 1c)

| Item | Decision |
|------|----------|
| Receipt files (v1) | **Local disk** — Docker volume on API container (e.g. `uploads_data` → `/data/uploads`) |
| Metadata | **Postgres** — `Receipt` table + `Folder` references |
| Access pattern | Authenticated API routes (multipart upload, streamed download) |
| Future migration | **S3-compatible** (R2, Oracle Object Storage) behind same `FileStorage` interface |
| Backup | Operator backs up volume + Postgres (see NFR-REL-03) |

### 9.4 Database

**Production:** PostgreSQL 16 in Docker on the Oracle VM (`docker-compose.prod.yml`). Persistent volume `postgres_data`.

**Local dev:** PostgreSQL 16 in Docker (`docker-compose.yml`).

Prisma migrations in `packages/db` run against both environments.

### 9.5 GraphQL server + ORM

**Decision: Apollo Server + Prisma.**

### 9.6 Architecture constraints

**CON-ARCH-01:** One GraphQL schema in `packages/graphql` serves web and future mobile — no separate REST surface unless justified.

**CON-ARCH-02:** Google Calendar remains external source of truth — do not duplicate full calendar state as primary store.

**CON-ARCH-03:** Design modules as **bounded contexts** within one deployable app (tasks, finance, calendar, meals, receipts) sharing auth, household context, and **shared folder infrastructure**.

**CON-ARCH-05:** **File storage** is accessed only through a **`FileStorage` interface** in `apps/api` — local volume in v1; S3-compatible backends later without domain rewrites.

---

## 10. Development & operations

### 10.1 Local development

**REQ-DEV-01 (P0):** `docker compose up` starts everything needed for local development (postgres + api + web).

### 10.2 Deployment

**REQ-DEV-02 (P0):** Production deploys to an **Oracle Cloud VM** via `docker-compose.prod.yml` + `scripts/deploy.sh`. See `docs/deployment/oracle-vm.md`.

**REQ-DEV-03 (P1):** Weekly backup via `scripts/backup-db.sh` (cron on VM); optional upload to Google Drive via `rclone`.

**REQ-DEV-04 (P1):** Production uses **two subdomains**: web (`WEB_DOMAIN`) and API (`API_DOMAIN`), both behind Caddy HTTPS.

### 10.3 Cost expectations

- Oracle Cloud Always Free ARM VM: **$0/month** (within free tier limits).
- Domain registration (~$10–15/year).
- Google Drive for backup storage (existing account).
- Plaid/bank API fees — only in distant future.

### 10.4 Agent workflow

When LLM agents implement features:

1. Read this document and the relevant `REQ-*` IDs.
2. Implement with tests (Vitest + Playwright for user-facing flows).
3. Run full test suite before marking work complete.
4. Do not add scope outside §3.2 without owner approval.

---

## 11. Glossary

| Term | Definition |
|------|------------|
| **Household** | The family unit — all linked users share one data namespace |
| **Allowlist** | Explicit list of Google accounts permitted to authenticate |
| **Source of truth** | The authoritative system for a data type (Google for events, bank app for balances) |
| **Manual mirror** | Data entered by hand in this app to reflect reality elsewhere |
| **MVP-lite** | Minimal version shipped alongside MVP, not blocking MVP but included in first release wave |
| **Core trio** | Tasks, Finance, Calendar |
| **Folder namespace** | Isolates folder trees per module (`MEALS`, `RECEIPTS`) within one household |
| **FileStorage** | API abstraction for reading/writing file bytes (local volume or object storage) |

---

## 12. Resolved decisions

All open questions are resolved. Reference for agents and future you:

| ID | Decision |
|----|----------|
| OQ-01 | MVP success = both adults use task + budget views; calendar integrated (§1.4) |
| OQ-02 | No custom account recovery — Google only |
| OQ-03 | **Docker Postgres on Oracle VM** for production; Docker Postgres for local dev |
| OQ-04 | **Apollo Server** (GraphQL) + **Prisma** (ORM) |
| OQ-05 | **Local Docker volume** for receipt files (v1); `FileStorage` abstraction for future S3 |
| OQ-06 | Per-task notifications via **web push** |
| OQ-07 | **No audit trail** — explicitly out of scope |
| OQ-08 | **No encryption** on Google Drive backups |
| OQ-09 | Allowlist via **env/config** for now |

---

## 13. Document changelog

| Date | Change |
|------|--------|
| 2026-07-02 | **Receipt management (Phase 1c):** REQ-RCPT-01 … REQ-RCPT-13 — standalone `/receipts` nav, household-shared uploads (images + PDF, 10 MB max, picker + drag-drop), preview/rename/delete, local volume storage + `FileStorage` abstraction. **Shared folders:** REQ-FOLDER-01 … REQ-FOLDER-06 — generic `Folder` model, migrate meal `RecipeFolder`, shared UI/GraphQL. See `docs/design/DESIGN.md` §8.11–8.12. |
| 2026-06-24 | Meal planning refinements: recipe modal, PST Sunday cron (slots only), grocery Bought + Remove bought, delete clears slots, ingredient merge with multi-qty strings |
| 2026-06-24 | Meal planning (Phase 1b): weekly Sun–Sat grid (day names only), household recipe library, drag-and-drop slots, Sunday auto-clear, grocery list auto + manual with ingredient merge. See REQ-MEAL-01 … REQ-MEAL-08 and `docs/design/DESIGN.md` §8.10. |
| 2026-06-25 | UI alignment: Kanban default home (REQ-SHELL-01); module sidebar nav (REQ-SHELL-03); multi-assignee (REQ-TASK-05); statuses BACKLOG/WAITING/DONE collapsible (REQ-TASK-06); kanban DnD (REQ-TASK-07); List view (REQ-TASK-14); filters deferred (REQ-TASK-15). See `docs/design/DESIGN.md`. |
| 2026-06-24 | Production hosting: **Oracle Cloud VM** (Docker Compose + Caddy); deploy guide at `docs/deployment/oracle-vm.md` |
| 2026-06-24 | Monorepo split: `apps/api`, `apps/web`, `packages/{db,graphql,shared}`; API auth via Google OAuth + JWT |
| 2026-06-24 | Resolved open questions OQ-01–02, OQ-05–09; added Postgres and GraphQL/ORM comparisons (§9.4–9.5); removed audit trail requirement |
| 2025-06-24 | Initial requirements synthesized from discovery Q&A (70 questions + 6 clarifications) |

---

## Appendix A — Requirements index

<details>
<summary>Click to expand full REQ/NFR/SEC ID list</summary>

**Vision:** REQ-VISION-01, REQ-VISION-02  
**Users:** REQ-USER-01 … REQ-USER-06  
**Permissions:** REQ-PERM-01 … REQ-PERM-03  
**Shell:** REQ-SHELL-01 … REQ-SHELL-03  
**Tasks:** REQ-TASK-01 … REQ-TASK-07, REQ-TASK-10 … REQ-TASK-15, REQ-TASK-20  
**Finance:** REQ-FIN-01 … REQ-FIN-06, REQ-FIN-20  
**Calendar:** REQ-CAL-01 … REQ-CAL-05  
**Meals:** REQ-MEAL-01 … REQ-MEAL-08  
**Receipts:** REQ-RCPT-01 … REQ-RCPT-13  
**Folders (shared):** REQ-FOLDER-01 … REQ-FOLDER-06  
**Home:** REQ-HOME-01  
**Data:** REQ-DATA-01 … REQ-DATA-06  
**Dev:** REQ-DEV-01 … REQ-DEV-04  
**NFR:** NFR-PERF-01, NFR-PERF-02, NFR-REL-01, NFR-REL-02, NFR-REL-03, NFR-MAINT-01 … NFR-MAINT-03, NFR-TEST-01 … NFR-TEST-03, NFR-PORT-01, NFR-PORT-02  
**Security:** SEC-AUTH-01 … SEC-AUTH-04, SEC-TRANSPORT-01, SEC-STORAGE-01, SEC-STORAGE-02, SEC-EXPOSE-01, SEC-EXPOSE-02, SEC-SECRET-01, SEC-DATA-01, SEC-DATA-02, SEC-DATA-03  
**Constraints:** CON-DEPLOY-01, CON-DEPLOY-02, CON-ARCH-01 … CON-ARCH-05  

</details>
