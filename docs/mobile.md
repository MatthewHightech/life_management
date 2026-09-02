# Life Management — Mobile App

> **Status:** Requirements complete — ready for implementation planning  
> **Last updated:** 2026-09-02  
> **Audience:** Project owner, future contributors, LLM coding agents  
> **Purpose:** Requirements and decisions for the React Native companion app.  
> **Related:** [`requirements.md`](requirements.md) · [`design/DESIGN.md`](design/DESIGN.md)

---

## 1. Vision

Build a **native mobile app (React Native / Expo)** alongside the existing web app. It connects to the **same GraphQL API** and authenticates the **same Google OAuth users** in the same household.

The mobile app is intentionally **reduced scope** — mobile-optimal workflows only, not a port of every web feature.

**App name (home screen):** **Life**

**Day-one users:** Both adults in the household.

### 1.1 In scope (MVP)

| Module | Mobile focus |
|--------|----------------|
| **Tasks** | List, add, edit; full field parity; comments; push reminders |
| **Finance** | Budget purchase inbox (sort into sections); full shopping list |
| **Meals** | Grocery list (incl. meal-plan items); full recipe CRUD + URL import |
| **Receipts** | Capture/upload; folder browser; multi-page receipts |
| **Gear** | Full CRUD with single photo; browse grouped by class |

### 1.2 Explicitly out of scope (MVP)

| Feature | Notes |
|---------|-------|
| Android | iOS first; Android later |
| Demo mode | Sign-in required |
| Offline support | Online-only |
| Global search | — |
| Quick-add FAB | Module-specific add buttons only |
| Kanban / calendar task views | List view only |
| Budget summary / reports | No spent-vs-allocated view on mobile |
| Plaid / bank sync | Hidden entirely on mobile |
| Meal planning week grid | Web-only |
| Dark mode | Light mode only |
| Folder rename/delete (receipts) | Create folders only for now |
| Multiple photos per gear item | One photo only |

---

## 2. Technical context (existing stack)

| Layer | Web today | Mobile approach |
|-------|-----------|-----------------|
| API | GraphQL at `{API_URL}/graphql` | Same endpoint; mobile codegen |
| Auth | Google OAuth → HttpOnly session cookie | **New token path:** OAuth → refresh token in secure storage |
| Allowlist | Same env/config as web | **Same allowlist** — no separate mobile list |
| Client | Apollo Client + codegen in `apps/web` | Apollo Client + codegen in `apps/mobile` |
| Monorepo | npm workspaces (`apps/*`, `packages/*`) | New `apps/mobile` |
| Design | Kinship design system | Hybrid — Kinship colors, iOS-native layouts |
| Push | N/A | **Expo Push** — task due-date reminders (day-of, assigned to you) |
| Image upload | REST endpoints for receipts/gear | Same REST endpoints |

---

## 3. Feature requirements

Requirements use `MOB-*` IDs. Priority: `P0` = MVP blocker · `P1` = MVP desired · `P2` = post-MVP.

### 3.1 Tasks

| ID | Priority | Requirement | Notes |
|----|----------|-------------|-------|
| MOB-TASK-01 | P0 | List household tasks in a mobile list view | Tap row → detail/edit; checkbox to complete |
| MOB-TASK-02 | P0 | Create new tasks | Module header add button (no global FAB) |
| MOB-TASK-03 | P0 | Edit existing tasks | Detail screen on tap |
| MOB-TASK-04 | P0 | Task fields match web | Title, description, assignee, due date, status, priority, etc. |
| MOB-TASK-05 | P0 | Sort/filter same as web | — |
| MOB-TASK-06 | P0 | Assignee picker with avatars | Match web |
| MOB-TASK-07 | P0 | Completed tasks hidden by default | Expandable section to reveal |
| MOB-TASK-08 | P0 | Read and add task comments | Full parity |
| MOB-TASK-09 | P2 | Kanban / calendar views | **Out of scope** |

### 3.2 Finance

| ID | Priority | Requirement | Notes |
|----|----------|-------------|-------|
| MOB-FIN-01 | P0 | Budget purchase inbox — simplified mobile card list | Not full web inbox UI |
| MOB-FIN-02 | P0 | Sort purchases into budget sections via drag | Drag-to-section |
| MOB-FIN-03 | P0 | Full shopping list management | Check off, add, edit quantity, delete, comments |
| MOB-FIN-04 | P2 | Budget summary / reports | **Out of scope** |
| MOB-FIN-05 | P2 | Plaid / bank sync | **Hidden on mobile** |

Finance tab uses segmented control: **Inbox | Shopping** (no Budget segment).

### 3.3 Meals

| ID | Priority | Requirement | Notes |
|----|----------|-------------|-------|
| MOB-MEAL-01 | P0 | Full grocery list management | Check off, inline add, edit quantities, delete |
| MOB-MEAL-02 | P0 | Show meal-plan-derived grocery items | Same auto-population as web |
| MOB-MEAL-03 | P0 | View recipes | — |
| MOB-MEAL-04 | P0 | Full recipe create/edit | Structured ingredients, steps, etc. |
| MOB-MEAL-05 | P0 | Recipe photos | View and add |
| MOB-MEAL-06 | P0 | Import recipe from URL | Mobile + web |
| MOB-MEAL-07 | P2 | Meal planning week grid | **Out of scope** |

Meals tab uses segmented control: **Grocery | Recipes**.

### 3.4 Receipts

| ID | Priority | Requirement | Notes |
|----|----------|-------------|-------|
| MOB-RCPT-01 | P0 | Capture via camera, photo library, iOS document scan | — |
| MOB-RCPT-02 | P0 | Upload and place in folder structure | — |
| MOB-RCPT-03 | P0 | Browse receipts and folders | **List view** (not grid) |
| MOB-RCPT-04 | P0 | Multi-page receipts | Several photos → one receipt |
| MOB-RCPT-05 | P0 | Rename, notes, delete, move between folders | — |
| MOB-RCPT-06 | P0 | Create folders | Rename/delete folders deferred |

### 3.5 Gear

| ID | Priority | Requirement | Notes |
|----|----------|-------------|-------|
| MOB-GEAR-01 | P0 | Add gear with photo | One photo per item |
| MOB-GEAR-02 | P0 | Browse gear library grouped by class | — |
| MOB-GEAR-03 | P0 | Edit and delete gear | — |
| MOB-GEAR-04 | P0 | Gear class optional on add | Not required |

### 3.6 Shell & settings

| ID | Priority | Requirement | Notes |
|----|----------|-------------|-------|
| MOB-X-01 | P0 | Google OAuth sign-in (same allowlist as web) | — |
| MOB-X-02 | P0 | GraphQL data reflects same household as web | — |
| MOB-X-03 | P0 | Online-only | No offline cache |
| MOB-X-04 | P0 | Bottom tab navigation | Tasks, Finance, Meals, Receipts, Gear |
| MOB-X-05 | P0 | Default tab: Tasks | — |
| MOB-X-06 | P0 | Settings screen | Profile, sign out, notification prefs, about/version |
| MOB-X-07 | P0 | Sign out | Settings only |
| MOB-X-08 | P1 | Push: task due-date reminders | Day-of only; tasks assigned to you; Expo Push |
| MOB-X-09 | P2 | Demo mode | **Out of scope** |

---

## 4. Architecture decisions

| Decision | Choice | Date |
|----------|--------|------|
| App name | **Life** | 2026-09-02 |
| Platforms (MVP) | **iOS only** (Android later) | 2026-09-02 |
| Min iOS | **iOS 18+** | 2026-09-02 |
| Distribution | **TestFlight** (both adults) | 2026-09-02 |
| RN stack | **Expo** | 2026-09-02 |
| Auth | **API token path** — OAuth → refresh token in secure storage | 2026-09-02 |
| Allowlist | **Same as web** | 2026-09-02 |
| Session persistence | **Indefinite** | 2026-09-02 |
| MVP scope | **All five modules** | 2026-09-02 |
| Offline | **Online-only** | 2026-09-02 |
| Navigation | **Bottom tabs**; default **Tasks** | 2026-09-02 |
| Finance tab | Segmented: **Inbox \| Shopping** | 2026-09-02 |
| Meals tab | Segmented: **Grocery \| Recipes** | 2026-09-02 |
| Design | **Hybrid** — Kinship colors, iOS-native layouts, light only | 2026-09-02 |
| Receipt capture | Camera + library + document scan | 2026-09-02 |
| Push | **Expo Push**; day-of; assigned-to-you tasks | 2026-09-02 |
| Shared code | `@life/shared`, `@life/graphql`, mobile codegen | TBD |
| Image upload | Same REST endpoints as web | TBD |

---

## 5. Implementation phasing

Suggested build order:

1. **API auth tokens** — mobile OAuth callback, refresh token issuance/storage contract
2. **App shell** — Expo scaffold, Apollo client, tab nav, settings, sign-in
3. **Tasks** — highest daily-use value; validates auth + GraphQL + push
4. **Finance** — inbox drag-sort + shopping list
5. **Meals** — grocery + recipes + URL import
6. **Receipts** — camera/scan upload + folder browser
7. **Gear** — photo add + class-grouped browse
8. **Push notifications** — task due-date reminders (can parallel with Tasks)

---

## 6. Resolved discovery log

All discovery questions resolved 2026-09-02.

<details>
<summary>Full Q&A record</summary>

| # | Question | Answer |
|---|----------|--------|
| 1 | Mobile allowlist | Same as web |
| 2 | Day-one users | Both adults |
| 3 | Sign out | Settings screen only |
| 4 | Quick-add FAB | No |
| 5 | Global search | No |
| 6 | Settings contents | Profile, sign out, notification prefs, about/version |
| 7 | Task sort/filter | Same as web |
| 8 | Kanban | No |
| 9 | Assignee avatars | Yes, like web |
| 10 | Budget inbox UI | Simpler mobile list |
| 11 | Sort purchases | Drag to section |
| 12 | Shopping list | Full web parity (check off, quantity, comments, etc.) |
| 13 | Plaid | Hidden on mobile |
| 14 | Budget summary | No — out of scope |
| 15 | Grocery list | All operations |
| 16 | Meal-plan grocery items | Yes, visible |
| 17 | Recipe photos | View and add |
| 18 | Import recipe URL | Mobile + web |
| 19 | Multi-page receipts | Yes |
| 20 | Receipt rename/notes/delete/move | Yes |
| 21 | Folder management | Create only (for now) |
| 22 | Receipt browse layout | List |
| 23 | Gear class required | No |
| 24 | Gear photos | One per item |
| 25 | Gear browse | Grouped by class |
| 26 | Expo Push | Yes |
| 27 | Reminder timing | Day-of only |
| 28 | Reminder scope | Any task assigned to you |
| 29 | App name | Life |
| 30 | Must-have workflows | None specified |
| 31 | Explicitly off limits | None beyond §1.2 |

</details>

---

## 7. Changelog

| Date | Change |
|------|--------|
| 2026-09-02 | Initial doc from owner feature brief |
| 2026-09-02 | Foundational decisions: iOS/Expo/token auth/all modules/online-only |
| 2026-09-02 | UX decisions: tabs, hybrid design, tasks, receipts, TestFlight |
| 2026-09-02 | Module depth: full tasks/recipes/gear; finance inbox+shopping |
| 2026-09-02 | Cross-cutting: comments, push, no demo, iOS 18+ |
| 2026-09-02 | **Discovery complete** — all Q&A resolved; budget summary removed; settings/push/details finalized |
