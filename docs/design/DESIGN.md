---
name: Life Management UI
design_system_codename: Kinship
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#414846'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#717976'
  outline-variant: '#c1c8c4'
  surface-tint: '#46645c'
  primary: '#16342d'
  on-primary: '#ffffff'
  primary-container: '#2d4b43'
  on-primary-container: '#99bab0'
  inverse-primary: '#adcec3'
  secondary: '#126876'
  on-secondary: '#ffffff'
  secondary-container: '#a3ebfb'
  on-secondary-container: '#1a6c7a'
  tertiary: '#4a2500'
  on-tertiary: '#ffffff'
  tertiary-container: '#6b3800'
  on-tertiary-container: '#eda262'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c8eadf'
  primary-fixed-dim: '#adcec3'
  on-primary-fixed: '#01201a'
  on-primary-fixed-variant: '#2e4c44'
  secondary-fixed: '#a6eefe'
  secondary-fixed-dim: '#8ad1e1'
  on-secondary-fixed: '#001f25'
  on-secondary-fixed-variant: '#004e5a'
  tertiary-fixed: '#ffdcc2'
  tertiary-fixed-dim: '#ffb77b'
  on-tertiary-fixed: '#2e1500'
  on-tertiary-fixed-variant: '#6d3900'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
  sage-green: '#E9F0EE'
  muted-blue: '#E3F1F4'
  warm-amber: '#FEF5ED'
  border-subtle: '#E9ECEF'
  text-main: '#212529'
  text-muted: '#6C757D'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 28px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  title-lg:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '500'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  container-max: 1280px
  gutter: 20px
  sidebar-width: 260px
  sidebar-collapsed: 72px
---

# Life Management — UI Design System

> **Source:** Google Stitch export (codename **Kinship**) · **Product name:** Life Management  
> **Requirements:** [`docs/requirements.md`](../requirements.md) · **Status:** Living document  
> **Mockups:** Stitch exports in `docs/design/` (see §10). Mockups label the app “Hearth Home” — **implement as Life Management**.

---

## 1. Brand & personality

**Pragmatic, warm, and competent** — a digital hearth for the household. Organized without being clinical; approachable without being whimsical. Balances information density (finance, task lists) with a soft, encouraging tone for daily habits.

**Style:** Corporate / modern with a humanist twist — reliable SaaS structure (clear hierarchy, systematic spacing) softened by organic accents, generous whitespace, and tactile card surfaces. Like a well-organized physical planner in digital form.

**Naming (decided):**

| Context | Name |
|---------|------|
| User-facing product | **Life Management** |
| Design system / Stitch codename | Kinship (internal reference only) |
| Household label in UI | **Household** (or household name when we support it) |

---

## 2. Resolved design decisions

These decisions align the Stitch export with [`requirements.md`](../requirements.md). Update this table if the owner changes direction.

| Topic | Decision | Requirements |
|-------|----------|--------------|
| Product brand | **Life Management** (not “Hearth Home” from mockups) | REQ-VISION-01 |
| Default home | **Tasks → Kanban** at `/` | REQ-SHELL-01 |
| Sidebar | **Dark evergreen** (`primary` / `primary-container`); light content canvas — *mockups show a light sidebar; implement dark per this spec* | REQ-SHELL-02 |
| Sidebar collapse | **Phase 1** — expanded 260px + collapsed 72px icon rail | REQ-SHELL-02 |
| Top-level nav | **Module nav:** Tasks · Finance · Calendar · Meal Planning | REQ-SHELL-03 |
| Tasks module views (first pass) | **Kanban** (default) + **List** toggle only | REQ-TASK-12, REQ-TASK-14 |
| Tasks module views (later pass) | Today · task calendar · by person | REQ-TASK-10, REQ-TASK-11, REQ-TASK-13 |
| Google Calendar nav | Top-level **Calendar** — disabled until module ships | REQ-CAL-01 |
| Meal Planning nav | Top-level **`/meals`** — enabled; Phase 1b implements planning UI | REQ-MEAL-01 … REQ-MEAL-06 |
| Receipts nav | Top-level **`/receipts`** — standalone module (not under Finance) | REQ-RCPT-01 |
| Gear nav | Top-level **`/gear`** — Gear Inventory module (Phase 1d) | REQ-GEAR-01 |
| Shared folders | Generic folder UI + GraphQL reused by Meals, Receipts, and Gear | REQ-FOLDER-01 … REQ-FOLDER-06 |
| Create action | **"+ New Task"** on Tasks pages (not sidebar “+ New Entry”) | — |
| Kanban columns | TODO · IN_PROGRESS · WAITING · **DONE** (collapsible, open by default) | REQ-TASK-06 |
| Kanban interaction | **Drag-and-drop** between columns updates status | REQ-TASK-07 |
| Task comments | Overlay **right sidebar** thread; bubble on card/row with count + unread | REQ-TASK-08 … REQ-TASK-23 |
| Task description field | **Removed** — use comment thread instead | REQ-TASK-09 |
| Assignees | **Many-to-many** — multiple avatars per task | REQ-TASK-05 |
| Task card colors | **Priority chips** (amber for HIGH/URGENT); column **status accent** on kanban card top border | REQ-TASK-05 |
| List row categories | **Deferred** — no subtext/left color bar in first pass | §4.2.4 |
| Filters | **Deferred** (assignee, priority, more filters) | REQ-TASK-15 |
| Settings / admin footer | **Deferred** — no Settings nav or role badges in first pass | — |
| Module accent colors | Sage / blue / amber on finance, calendar, meals screens when built | §4.3–4.5 |
| Dark mode | **Out of scope** | §3.2 |
| Real-time / offline | Refresh-on-load | NFR-PERF-01 |

---

## 3. Colors

Palette anchored by **evergreen primary** (stability, growth). Purposeful accents categorize life pillars on **module screens**; task cards use priority semantics first.

### 3.1 Core tokens

Use YAML frontmatter values as source of truth for implementation.

| Token | Hex | Use |
|-------|-----|-----|
| **Primary** | `#16342d` | Sidebar background, primary buttons, brand |
| **Primary container** | `#2d4b43` | Sidebar hover, secondary brand surfaces |
| **On primary** | `#ffffff` | Text/icons on dark sidebar |
| **Secondary** | `#126876` | Informational accents, secondary actions |
| **Tertiary / warm** | `#D99152` (see `tertiary-container`) | Priority, urgency, attention |
| **Background** | `#f8f9fa` | App canvas (“paper”) |
| **Surface** | `#ffffff` | Cards, main content panels |
| **Sage green** | `#E9F0EE` | Finance module tint, completion/success chips |
| **Muted blue** | `#E3F1F4` | Calendar / logistics module tint |
| **Warm amber** | `#FEF5ED` | Priority chips, overdue, high-urgency tasks |
| **Border subtle** | `#E9ECEF` | Card borders (Level 1 elevation) |
| **Text main** | `#212529` | Body text |
| **Text muted** | `#6C757D` | Metadata, subtitles |
| **Error** | `#ba1a1a` | Destructive actions, critical errors |

### 3.2 Color application rules

**Tasks — Kanban (first pass):**

- White card, Level 1 border, subtle shadow.
- **Top border accent** colored by **column status** (blue todo, orange in-progress, red waiting, green done).
- **Priority chip** + **assignee avatars** on card footer row.
- **Delete** — trash icon top-right; **comments** — speech-bubble bottom-right with count + unread dot.
- **Subtask progress** optional: “N% complete” + bar when subtasks exist.
- Drag between columns → status update.
- **No** inline description on cards (REQ-TASK-09).

**Tasks — List (first pass):**

- Table columns: Task name · Status · Priority · Assignee(s) · Due date · **Comments**.
- Status/priority as pills; overdue row gets soft red background (per mockup).
- **No** category subtext or left color bar in first pass.
- Toggle with Kanban in Tasks header.

**Tasks — deferred styling:**

- Category subtext (“Finance & Documentation”) and project-colored left bars → use `TaskProject` in a later pass.
- Module-colored top borders on cards → not used on task cards.

**Finance / Calendar / Meals / Receipts (when built):**

- Use module background tints (sage, blue, amber) for section headers, summary cards, and category chips on those screens only.
- **Receipts:** sage-green module tint (§8.11) — distinct from warm-amber meals.
- Do not mix module colors onto task cards.

**Current app gap:** `apps/web` still uses slate/blue placeholder tokens in `globals.css` — migrate to this palette when implementing the shell redesign.

---

## 4. Typography

**Font:** Geist (already in Next.js app). Geist Mono for financial figures and aligned numeric columns.

| Role | Token | Size | Notes |
|------|-------|------|-------|
| Page title | `headline-md` / `headline-lg` | 24–32px | Tighter tracking on desktop |
| Section title | `title-lg` | 20px | |
| Today summary | `body-lg` | 18px | Intro copy on dashboards |
| Body | `body-md` | 16px | Default |
| Labels / metadata | `label-md` | 14px | |
| Category tags | `label-sm` | 12px | Uppercase for table headers |

**Numbers:** Use tabular/monospaced numerals in finance tables and budget trackers (REQ-FIN-04).

---

## 5. Layout & navigation

### 5.1 Grid

**Fluid-fixed hybrid:** fixed sidebar + fluid main content, max width **1280px**, 12-column grid on desktop.

| Breakpoint | Columns | Gutter | Sidebar |
|------------|---------|--------|---------|
| Desktop | 12 | 24px | Expanded 260px or collapsed 72px |
| Tablet | 8 | 20px | Collapsed icon rail |
| Mobile | 4 | 16px | Hidden → **bottom nav** (Tasks + key modules when enabled) |

**Spacing rhythm:** 4px base unit · 16px card padding · 24px section gaps.

### 5.2 Navigation structure

**Top-level sidebar (module nav):**

```
[Dark sidebar — Life Management / Household]     [collapse toggle]
  Tasks          →  /tasks          (active module)
  Finance        →  /finance/budget (default; redirects from /finance)
  Calendar       →  /calendar       (disabled — Google Calendar module)
  Meal Planning  →  /meals          (Phase 1b — weekly plan + grocery)
  Receipts       →  /receipts       (Phase 1c — file storage + folders)
  ─────────────────
  Sign out
  [User — name + avatar only; no Settings or ADMIN badge in first pass]

[Collapsed: 72px icon rail — “LM” or household initial logo]
```

**Inside Tasks module** (`/tasks`, default Kanban):

```
Header:  Tasks                    [+ New Task]
         [Kanban] [List]          ← view toggle (segmented control)

Kanban:  TODO | IN-PROGRESS | WAITING | DONE [Clear]     (overlay comments sidebar →)
List:    filter chips deferred (REQ-TASK-15)
```

| Route | View | Status |
|-------|------|--------|
| `/` or `/tasks` | Kanban (default) | **First UI pass** |
| `/tasks/list` | List table | **First UI pass** |
| `/tasks/today` | Today / inbox | Later pass |
| `/tasks/calendar` | Task due-date calendar | Later pass |
| `/tasks/people` | By assignee | Later pass |
| `/meals` | Meal planning (library + week grid + grocery) | **Phase 1b** |
| `/receipts` | Receipt management (upload + folders + preview) | **Phase 1c** |
| `/finance/budget` | Household budget (purchases inbox + monthly + annual tables) | **Phase 1e — V1** · **1f purchases inbox** |
| `/finance/reports` | Monthly Reports | Placeholder (Phase 1e nav only) |
| `/finance/purchase-list` | Purchase List | Placeholder (Phase 1e nav only) |

**Inside Finance module** (`/finance/budget`, default):

```
Header:  Finance                  [Budget] [Monthly Reports] [Purchase List]
                                              ↑ segmented control (Tasks toggle pattern)

Budget:  [Purchases inbox — collapsible]     ← Phase 1f
         July Budget (monthly table)
         2026 Annual Budget (annual table — collapsible)
         scoped sections + line items per table
```

| Route | View | Status |
|-------|------|--------|
| `/finance` | Redirect → `/finance/budget` | **Phase 1e** |
| `/finance/budget` | Purchases inbox + monthly/annual budget tables | **Phase 1e — V1** · **1f inbox** |
| `/finance/reports` | Monthly Reports | Placeholder |
| `/finance/purchase-list` | Purchase List | Placeholder |

**Do not** merge task due-date calendar with Google Calendar — separate modules (REQ-TASK-11 vs REQ-CAL-01).

**Mobile:** Bottom nav shows module icons (Tasks primary); Tasks sub-views via header toggle.

### 5.3 Sidebar behavior (Phase 1 — required)

- **Expanded (260px):** icon + label; household name at top.
- **Collapsed (72px):** icon-only; tooltip on hover.
- **Active item:** leading-edge primary bar + sage-green row tint (`sage-green` at low opacity).
- **Toggle:** persist preference in `localStorage`.

Replace emoji nav icons with a consistent icon set (e.g. Lucide) when implementing.

---

## 6. Elevation & depth

**Tonal layering** + ambient shadows — clean, not flat, not heavy.

| Level | Use | Treatment |
|-------|-----|-----------|
| 0 | Page background, inactive sidebar | Flat `background` |
| 1 | Task cards, meal slots | 1px `border-subtle`, no shadow |
| 2 | Hover, active card | `0 4px 12px rgba(0,0,0,0.05)` |
| 3 | Modals, dropdowns | `0 12px 24px rgba(0,0,0,0.1)` |

Prefer primary-tinted shadows at very low opacity over harsh black.

---

## 7. Shapes

| Radius | Use |
|--------|-----|
| `0.5rem` (default) | Buttons, inputs, small cards |
| `1rem` (lg) | Main view containers, modals |
| `full` (pill) | Status/priority chips only |

---

## 8. Components

### 8.1 Sidebar (dark)

- Background: `primary` (`#16342d`).
- Text/icons: `on-primary`.
- Active row: `primary-container` or sage tint + 3px leading accent bar in `inverse-primary`.
- Collapse control at bottom or top of sidebar.

### 8.2 Kanban board

Reference: [`Kanban_full_sidebar_homepage.png`](Kanban_full_sidebar_homepage.png), [`Kanban_collapsed_sidebar_homepage.png`](Kanban_collapsed_sidebar_homepage.png)

- Horizontal columns per status; column header: status dot, label (uppercase), count badge, “+” to add task in column.
- Cards draggable between columns (REQ-TASK-07).
- **Four columns:** TODO · IN_PROGRESS · WAITING · DONE. DONE collapsible (open by default); **Clear** control on DONE header (confirm before bulk delete).
- `WAITING` aligns with blocked/waiting-on-dependency workflow (REQ-TASK-04).

### 8.3 List view

Reference: [`list_view_homepage.png`](list_view_homepage.png)

- Sortable table layout inside Tasks module.
- Overdue: light red row background + red due date (soft, not harsh).
- FAB with edit icon — **optional for first pass**; “+ New Task” in header is required.

### 8.4 Task cards (shared)

- White surface, Level 1 border.
- Priority chip + assignee avatar(s).
- **Comments** speech-bubble (bottom-right on kanban) with numeric count and unread indicator.
- **Delete** trash icon (top-right on kanban); ghost button at row end on list.
- Hover → Level 2 elevation.
- **No description** field on card or list (REQ-TASK-09).

### 8.5 Buttons

| Variant | Style |
|---------|--------|
| Primary | Solid `primary-container` or `primary`, white text |
| Secondary | `sage-green` background, `primary` text |
| Ghost | Transparent; border on hover |

### 8.6 Inputs

- Min height **44px** (touch-friendly, REQ-SHELL-02).
- 1px border → primary on focus.
- **Visible labels** always — no placeholder-only forms (important for finance entry).

### 8.7 Chips & status

- Pill shape.
- Tinted background + dark text of same hue (e.g. warm amber + dark brown for “Urgent”).
- Blocked / overdue: soft amber, not aggressive red unless critical.

### 8.8 Finance — Budget page (Phase 1e + 1f)

Reference: REQ-FIN-07 … REQ-FIN-16 (tables) · REQ-FIN-17 … REQ-FIN-26 (purchases inbox) · module accent **sage green** (`sage` / `bg-sage` on section headers — §4.2.4).

**Page shell:** `ModulePageLayout` + `FinancePageLayout` (wraps sub-nav toggle, mirror `TasksPageLayout`).

**Sub-navigation:** `FinanceViewToggle` — segmented control with three links (same classes as `TasksViewToggle`): **Budget** · **Monthly Reports** · **Purchase List**. **Purchase List tab is unrelated** to the purchases inbox on the Budget page.

**Page layout (top → bottom on `/finance/budget`):**

```
[Budget] [Monthly Reports] [Purchase List]

▾ Purchases                          [Add purchase]   ← Phase 1f; collapsible
    [inline draft: name · amount · date]
    ┌─ draggable purchase chip ─┐
    │  Costco · $142.50 · Jul 3  │
    └────────────────────────────┘
    … scroll after ~5 items …

▾ July Budget                        [Add section]
    (monthly-scoped sections table)

▸ 2026 Annual Budget                 [Add section]   ← collapsed by default
    (annual-scoped sections table)
```

#### 8.8.1 Purchases inbox (Phase 1f)

Reference: REQ-FIN-17 … REQ-FIN-26.

**Placement:** Collapsible `sectionCardClass` block **above the monthly budget table only** (not above annual).

**Inbox list:** Mini-inbox — vertical draggable rows/chips; **max ~5 visible** then scroll. Shows **unassigned remainder** for the current budget month (PST).

**Add purchase:** **Inline draft row** at top (gear quick-add pattern) — **not** a modal. Fields: name · amount · purchase date. Date: **`CalendarPicker`** only (`components/ui/calendar-picker`, same as Tasks due date) — **no text date input**. If date is outside the displayed budget month → **save to correct month** + **non-blocking notice**.

**Drag-and-drop:** `@dnd-kit` — purchases (or remainder portions) draggable onto **monthly or annual** budget **line item** rows. Budget rows are drop targets (highlight on hover). Mirror Gear lend-staging → library drop affordances.

**Splitting model:**

| Concept | Rule |
|---------|------|
| **Purchase** | household, name, amountCents, purchaseDate, source (`MANUAL` \| `VISA`), optional `externalTransactionId` |
| **Allocation** | links purchase → budget line with `amountCents` |
| **Inbox visibility** | purchase visible while `sum(allocations) < purchase.total` |
| **Fully assigned** | when allocations sum = purchase total → **removed from inbox** |

**Spend:** Allocations increment line **Spent** — monthly lines in purchase month; annual lines as **YTD** in purchase year. **Remaining** shows **"$X over budget"** when over (REQ-FIN-15).

**Line-item purchases sidebar:** **Open** icon (e.g. panel icon) on each budget line row → **right slide-in panel** (`TaskCommentsSidebar` pattern: overlay, slide animation, close button). Table of allocations — **monthly lines:** current month only; **annual lines:** YTD. Columns: name · date · amount · source badge. Rows **draggable** to reassign to another line. **Inline edit** allocation amount. **Trash** delete allocation (`ConfirmModal`).

**Delete:** Any household adult may delete unassigned **MANUAL** purchases from the inbox; may delete allocations from the sidebar (returns purchase to inbox). **VISA (imported) purchases cannot be deleted** from the inbox.

**Plaid sync (REQ-FIN-20):** **Sync Credit Card** in inbox header → security modal → Plaid Link → account picker (credit cards only). **Bank settings** in Finance header manages synced accounts / disconnect. Nightly sync 9pm PST; sync on setup. Tokens encrypted at rest (`PLAID_TOKEN_ENCRYPTION_KEY`).

#### 8.8.2 Budget tables (Phase 1e — shipped)

**Monthly header:** `{Month} Budget` (e.g. “July Budget”) — current calendar month in PST; no month picker.

**Annual header:** `{Year} Annual Budget` — collapsible, **collapsed by default**.

**Table structure (per table — monthly and annual are independent):**

```
[Add section]                              ← button → modal (scope = table)

▾ Food  [+]  …trash…                       $800  $0  $800  [████████··]  [open]
    Groceries                               $500  $0  $500  [████████··]  [open]
    [draft row after + click]               name · amount
▸ Car     …                                 $400  $0  $400  [████████··]
```

| Row type | Columns | Notes |
|----------|---------|-------|
| **Section** (collapsible) | Name · Budget · Spent · Remaining · progress · actions | Totals = sum of children; **+** adds inline draft line; chevron expand/collapse |
| **Line item** | Name · Budget · Spent · Remaining · progress · **open** · trash | Indented under section; inline edit; **open** → purchases sidebar (§8.8.1) |
| **Draft line item** | Inline inputs | Appears after **+** on section row; commit on Enter/blur |
| **Footer** | **Total** row | Sum of line items in that table |

**Scoped sections:** `BudgetSection.scope` = `MONTHLY` | `ANNUAL`. Monthly and annual tables each have **their own section lists** (same name allowed in both).

**Add flows (mirror Gear library):**

| Action | Pattern |
|--------|---------|
| **Add section** | Header **“Add section”** button → `Modal` (name only; scope from active table) |
| **Rename section** | Inline `EditableTextCell` on section row |
| **Add line item** | **+** on section row → inline draft row under that section |
| **Delete section** | Trash → `ConfirmModal` cascade delete children |

**Line item scope:**

| Table | Limit applies to | Spent resets |
|-------|------------------|--------------|
| **Monthly** | Current calendar month | 1st of each month |
| **Annual** | Calendar year (Jan–Dec) | January 1 |

**Spend (Phase 1f):** Populated by **purchase allocations** (REQ-FIN-23 … REQ-FIN-24). Persist spend rows in DB per month (monthly) and per year (annual YTD).

**Interactions:**

- **Sections:** **Add section** modal · inline rename · trash + `ConfirmModal` cascade.
- **Line items:** **+** on section row → inline draft row · inline edit on saved rows · trash + confirm · **open** purchases sidebar.
- **Purchases:** DnD from inbox → line items; DnD from sidebar → reassign (§8.8.1).
- Reuse: `sectionCardClass` / `sectionHeaderClass`, `EditableTextCell`, `ConfirmModal`, `CalendarPicker`, `BudgetTable` + `budget-scope.ts` config, `@dnd-kit`, `TaskCommentsSidebar` slide pattern.

**Visual:**

- Monospaced/tabular numerals, **right-aligned** amount columns (REQ-FIN-15).
- **Progress bar** per row: **remaining** budget (full bar = green; shrinks; green → yellow → red). Over budget: **"$X over budget"** in Remaining column.
- Sage tint on page section wrappers (`sectionCardClass`).

**Currency:** CAD only — format as `$1,234.56`; no currency selector.

**Timezone:** Month and year boundaries use **America/Los_Angeles** (PST/PDT).

**Out of scope (Budget 1e/1f tables):** Monthly Reports UI, **Purchase List** sub-page, general expense/income log, month browser, income rows, recurring bills.

### 8.9 Calendar views (future)

- **Task calendar:** due-date grouping (current implementation direction).
- **Google Calendar:** separate Events UI; muted-blue module tint; read/write per REQ-CAL-02/03.

### 8.10 Meal planning (Phase 1b)

Reference: REQ-MEAL-01 … REQ-MEAL-09 · module accent **warm amber** (`warm-amber` / tertiary tints on section headers and chips — not on task cards).

**Page structure** (desktop, top → bottom, inside `ModulePageLayout`):

1. **Recipe library** — household-shared saved meals. Each recipe: name, ingredients (name + optional qty/unit), instructions, servings. **Nested colored folders** (shared folder components — §8.12). **Create / edit** via **modal** (`Modal` in `components/ui`). **Import from URL** (secondary) → fetch Schema.org Recipe JSON-LD on the API (`@life/recipe-import`) → prefill create modal for review. Delete from library row/card. Compact **draggable** list rows (pattern: kanban card density + grip handle).
2. **Weekly plan grid** — **Sunday → Saturday** columns (or rows on mobile). Each day: **breakfast · lunch · dinner** drop targets. Show **day names only** (Sun, Mon, … Sat) — no calendar dates on the grid. Empty slots are valid. **One meal per slot**; drop replaces existing assignment. **DnD:** `@dnd-kit` (same stack as Tasks kanban).
3. **Grocery list** — auto-built from week grid ingredients; merge by name per REQ-MEAL-05. Manual add/edit/delete. **Bought** checkbox + strikethrough. Header action: **Remove bought items** (deletes checked rows only).

**Interactions:**

- **Drag-and-drop** from recipe library onto a slot (REQ-MEAL-02). `@dnd-kit` with grip handle on library rows (mirror kanban).
- **Recipe CRUD:** modal form for create/edit; reuse `Modal`, `Button`, inline inputs (min-height 44px). Delete clears slots using that recipe this week.
- **Sunday rollover:** server **cron at 00:00 Sunday Pacific** (`America/Los_Angeles`) clears **slot assignments only** (REQ-MEAL-04). Grocery list is **not** auto-cleared.
- Grocery: **Bought** checkbox per row; **Remove bought items** button removes checked rows. Auto rows update when grid assignments change.

**Visual:**

- Module background tints: warm amber on section headers / summary strips (§4.2.4 pattern for module screens).
- Week grid: white `surface` cells, `border-subtle` grid lines; dropped meal shows recipe name (+ optional servings chip).
- Grocery: checkbox **Bought** + strikethrough; toolbar **Remove bought items**.

**Mobile (REQ-MEAL-07):** Stack library → grid → grocery. Week grid horizontal scroll if needed.

**Out of scope (Phase 1b):** Pantry inventory, nutrition, meal-prep timers, copy-last-week, date-picker weeks, Google Calendar meal events (REQ-MEAL-08).

### 8.11 Receipt management (Phase 1c)

Reference: REQ-RCPT-01 … REQ-RCPT-13 · module accent **sage green** (`sage-green` on section headers — finance-adjacent but separate module).

**Page structure** (inside `ModulePageLayout`):

1. **Upload area** — dashed drop zone at top of content. Supports **file picker** (button) and **drag-and-drop** of files onto the zone. Accepts images (JPEG, PNG, WebP, HEIC if supported) and PDF. Max **10 MB** per file. Show clear error for oversize or unsupported type. New uploads land in the **current folder** (or root if at top level).
2. **Folder browser** — shared folder shell (§8.12): breadcrumbs, compact colored folder tiles, **Add folder** + color picker (six pastel swatches). Separate `RECEIPTS` namespace — not shared with meal folders.
3. **Receipt list** — rows/cards below folders in current directory. Each row: thumbnail (images) or PDF icon, **filename**, upload date (optional metadata for display only). Actions: **preview** (modal or inline), **rename** (inline or modal), **delete** (confirm). **Drag** receipt rows into folders (zone-aware DnD — folders only while pointer is in library zone; no meal-slot targets).

**Interactions:**

- Upload → file saved via API → `Receipt` row created → appears in current folder.
- **Preview:** images in modal/lightbox; PDF in embedded viewer or authenticated new tab.
- **Rename / delete:** GraphQL mutations; delete removes DB row **and** file bytes from volume.
- **DnD:** receipt file rows draggable into folder tiles and breadcrumb crumbs (same pattern as recipes).

**Visual:**

- Sage-green section header strip (like finance module tint).
- Upload zone: dashed `border-subtle`, sage tint on drag-over.
- Folder tiles: compact pastel buttons (shared `FolderTile` — §8.12).
- Receipt rows: white `surface`, thumbnail left, filename, icon actions right.

**Mobile:** Stack upload zone → breadcrumbs → folders → file list. Preview full-width.

**Out of scope (Phase 1c):** OCR, amount/date/vendor fields, search, finance transaction linking, email-in capture.

### 8.12 Shared folder system (cross-module)

Reference: REQ-FOLDER-01 … REQ-FOLDER-06. **Single implementation** — meals, receipts, and gear compose the same primitives.

**Shared components** (`apps/web/src/components/folders/`):

| Component | Role |
|-----------|------|
| `FolderTile` | Compact pastel folder button; droppable; shows name + item count |
| `FolderBreadcrumbs` | `Recipes` / `Receipts` / `Gear` root crumb + path; navigable; droppable crumbs |
| `FolderFormModal` | Name + six circle color swatches |
| `FolderBrowser` | Shell: header actions, breadcrumbs, folder grid, `{children}` slot for module items |

**Shared packages:**

| Layer | Location |
|-------|----------|
| Colors / drop-id helpers | `packages/shared` (generalize from meal-plan folder helpers) |
| `Folder` model + `FolderNamespace` enum | `packages/db` (`MEALS`, `RECEIPTS`, `GEAR`) |
| Folder GraphQL types + mutations | `packages/graphql/src/folders/` |
| DnD zone helpers | `apps/web/src/lib/folder-dnd.ts` (generalize from `meal-plan-dnd.ts`) |

**Migration:** Existing `RecipeFolder` → `Folder` where `namespace = MEALS`. Meal planning page switches to shared components without UX regression.

**DnD zones (per module page):**

- **Library zone** (recipe/receipt section ref): folder + breadcrumb droppables only.
- **Module-specific zones** (e.g. meal schedule grid): module drop targets only when pointer enters that section.
- Use `pointerWithin` first, filtered by zone — same pattern as current meal planning fix.

### 8.13 Task comment threads

Reference: REQ-TASK-08 … REQ-TASK-23 · replaces task `description` (REQ-TASK-09).

**Entry points**

| Surface | Control | Placement |
|---------|---------|-----------|
| Kanban card | Speech-bubble button | **Bottom-right** (symmetric to delete trash at top-right) |
| List row | Speech-bubble button | **End of row** (after due date / actions) |

**Control chrome**

- Show **total comment count** on the bubble when count > 0.
- **Unread dot** (or badge) when the current user has not read comments since last opening that task’s sidebar.
- Icon: Lucide `MessageCircle` (or equivalent); same ghost/hover pattern as delete.

**Sidebar panel (overlay)**

```
┌──────────────────────────────┐  ┌─────────────────────────┐
│  Main content (kanban/list)  │  │  Task title          [X]│
│  (dimmed scrim behind panel) │  │  ─────────────────────  │
│                              │  │  [Newest comment]       │
│                              │  │  author · time          │
│                              │  │  body with linkified URL│
│                              │  │  [Older comment…]       │
│                              │  │  ─────────────────────  │
│                              │  │  [ Compose textarea ]   │
│                              │  │  [ Post ]               │
└──────────────────────────────┘  └─────────────────────────┘
```

| Behavior | Spec |
|----------|------|
| Layout | **Overlay** on right; fixed width ~360–400px on desktop; full-width sheet on narrow mobile |
| Scrim | Click outside panel **or** X → close |
| Task switch | Opening bubble on task B while A is open → **switch to B immediately** (no confirm) |
| Thread order | **Newest first** (chat-style scroll; compose pinned bottom) |
| Content | Plain text only; render URLs as clickable links |
| Permissions | Any household member; full visibility on tasks user can already see |
| Delete | Author may delete **own** comment only (confirm optional — match delete-task pattern) |
| Sync | **Refresh on open**; refetch after post/delete; no websocket in v1 |
| Subtasks | **One thread per task** (top-level task id); no separate subtask threads |

**Data model (implementation hint — not binding UI)**

| Entity | Fields (conceptual) |
|--------|---------------------|
| `TaskComment` | `id`, `taskId`, `authorId`, `body`, `createdAt` |
| `TaskCommentRead` (or last-read timestamp) | `userId`, `taskId`, `readAt` — powers unread badge |

Drop `Task.description` column; **do not migrate** existing description text.

**GraphQL (conceptual)**

- `Task.comments` or `taskComments(taskId)` query
- `addTaskComment(taskId, body)` mutation
- `deleteTaskComment(id)` mutation (author check)
- `markTaskCommentsRead(taskId)` mutation (on sidebar open)
- Extend `Task` type: `commentCount`, `unreadCommentCount` (for list/kanban badges)

**Removals**

- Remove description from kanban card, list table, quick-add row, GraphQL inputs, Prisma schema.
- List table: drop description column; add comments column with bubble control only.

**Future (REQ-TASK-23)**

- Web push / in-app notification when someone comments on a task you follow or are assigned to — schema should not block this; UI deferred.

### 8.14 Gear inventory (Phase 1d)

Reference: REQ-GEAR-01 … REQ-GEAR-19 · module accent **muted blue** (`muted-blue` on section headers — equipment / logistics; distinct from sage receipts and warm-amber meals).

**Page structure** (desktop, top → bottom, inside `ModulePageLayout`):

```
┌─────────────────────────────────────────────────────────────┐
│  Gear library — folders · standalone items · item classes   │
├─────────────────────────────────────────────────────────────┤
│  Lend staging zone — drop items here · staged chips · form  │
├─────────────────────────────────────────────────────────────┤
│  Active loans table                                         │
├─────────────────────────────────────────────────────────────┤
│  ▸ Loan history (collapsed) · [Clear history]               │
└─────────────────────────────────────────────────────────────┘
```

#### Gear library

1. **Activity folders** — shared folder shell (§8.12), `GEAR` namespace, root crumb **“Gear”**. Nested colored folder tiles; breadcrumbs when inside a folder.
2. **Standalone items** — draggable rows/cards: thumbnail (if photo), name, size, condition chip, description/care on expand or edit modal. **“Out on loan”** badge when lent; not draggable to lend zone.
3. **Item classes** — container rows (e.g. **“Wetsuit boots”**) with variant count. Click/open → **variant table**:
   - Columns: thumbnail · variant name · size · condition · actions
   - Shared **description** and **care instructions** shown on class header (not per-row in v1)
   - Example: class “Wetsuit boots” · variant “Xcel 3mm” · size “10” · condition `GOOD`
4. **Add actions** — header: **Add folder** · **Add item** · **Add item class**. Create/edit via modals.

| Field | Standalone item | Item class | Variant |
|-------|-----------------|------------|---------|
| Name | ✓ | ✓ (class name) | ✓ (variant name) |
| Description | ✓ | ✓ (shared) | inherits class |
| Size | ✓ free text | — | ✓ free text |
| Care instructions | ✓ | ✓ (shared) | inherits class |
| Condition | ✓ | — | ✓ |
| Photo | optional | — | optional |
| Folder | optional | optional | — (via class) |

**Condition chips:** `LIKE_NEW` · `GOOD` · `FAIR` · `RETIRED` (muted/disabled styling; not lendable).

**Item ↔ class:** An item is standalone **or** a variant — never both. **Promote** standalone → class member: deferred (schema should allow later).

**Photos:** Reuse `FileStorage` + authenticated download (same pattern as receipts). JPEG/PNG/WebP; thumbnail in rows. One photo per standalone item or variant.

#### Lend staging zone

- Dashed drop target below library (muted-blue tint on drag-over).
- Accept drops of **standalone items** and **variant rows** only — **not** item classes.
- Staged items appear as removable chips (thumbnail + name).
- **Form:** borrower name · email (required) · lent date (default today) · return-by (required, must be after lent date).
- **Lend** → creates one loan, clears staging, refreshes active loans + library badges.

**DnD zones:**

| Zone | Drop targets |
|------|----------------|
| Library | Folders, breadcrumbs |
| Lend staging | Gear items / variants only |

Use zone-aware collision detection (§8.12) — library DnD must not fire when pointer is over lend zone.

#### Active loans table

| Column | Content |
|--------|---------|
| Borrower | Name + email |
| Items | Thumbnails + names (compact list) |
| Lent | Date |
| Return by | Date — **red** if overdue |
| Actions | **Mark returned** (whole loan, all items) |

Overdue rows: soft red background (mirror list-view overdue tasks).

#### Loan history

- **Collapsed** by default below active loans.
- Same row shape as active loans + returned date (optional display).
- **Clear history** — confirm modal; deletes history records only.

**Future:** borrower `email` stored for automated reminder emails (REQ-GEAR-16); no send in v1.

**Visual:**

- Muted-blue section header strips.
- Folder tiles: shared `FolderTile`.
- Variant table: white `surface`, compact rows, inline edit or row actions menu.

**Desktop-first (REQ-GEAR-19):** No dedicated mobile layout in Phase 1d.

**Out of scope (Phase 1d):** search/filter, barcode, finance linking, household-member borrowers, partial returns, email automation.

---

## 9. Implementation plan

### 9.1 Next UI pass (awaiting owner approval)

| Layer | Work |
|-------|------|
| **Design tokens** | Migrate `globals.css` to Kinship palette |
| **App shell** | Dark collapsible sidebar · module nav · Lucide icons |
| **Routing** | `/` → Kanban · `/tasks/list` · retire old per-view sidebar links |
| **Database** | `BACKLOG`, `WAITING` statuses · task↔assignee many-to-many |
| **GraphQL** | Status enum · multi-assignee · move-task / update-status for DnD |
| **Kanban** | Columns · drag-and-drop · collapsible DONE · “+ New Task” |
| **List** | Table view · overdue styling · Kanban/List toggle |
| **Codegen** | Update operations after schema changes |

**Not in this pass:** filters (REQ-TASK-15), Today/calendar/people views, category subtext, Settings, sidebar “+ New Entry”, FAB (optional later).

### 9.2 Later passes

| Pass | UI work |
|------|---------|
| **Task views** | Today · task calendar · by person |
| **Task polish** | Filters · category/project subtext on list rows |
| **Finance** | Budget dashboard (sage accent) — **Phase 1e: Budget table V1** |
| **Calendar** | Google Calendar module (blue accent) |
| **Meals (Phase 1b)** | Recipe library · Sun–Sat grid · DnD to slots · grocery list · Sunday auto-clear |
| **Deferred** | Dark mode · Settings · admin roles UI |

### 9.3 Meal planning pass (Phase 1b — next)

| Layer | Work |
|-------|------|
| **Database** | `Recipe`, `RecipeIngredient`, `MealPlanSlot` (household + week anchor or rollover job), `GroceryListItem` |
| **GraphQL** | Recipe CRUD · week plan query/mutations · slot assign/replace · grocery list query/mutations |
| **Cron** | Sunday 00:00 **America/Los_Angeles** — clear `MealPlanSlot` rows only |
| **Web `/meals`** | `ModulePageLayout` · recipe library (DnD rows) · 7×3 grid · grocery list + Remove bought · warm-amber accents · recipe `Modal` |
| **Grocery merge** | Aggregate ingredients by name from assigned slots; manual items merged in same list |
| **Codegen / tests** | Operations + unit tests for merge logic and week boundary |

**Not in Phase 1b:** multi-week history, copy forward, nutrition, pantry, calendar sync (REQ-MEAL-08).

### 9.4 Receipt management pass (Phase 1c — next)

| Layer | Work |
|-------|------|
| **Shared folders** | `Folder` + `FolderNamespace` · migrate `RecipeFolder` · `packages/graphql/src/folders/` · `components/folders/*` · refactor meals to shared folder UI |
| **Database** | `Receipt` (metadata + `storageKey`, `folderId`) |
| **API storage** | `FileStorage` interface · local volume in Docker · multipart upload route · authenticated download |
| **GraphQL** | `receipts` query (folders + files for namespace) · `uploadReceipt` / `renameReceipt` / `deleteReceipt` · `moveReceiptToFolder` · shared folder mutations |
| **Web `/receipts`** | `ModulePageLayout` · upload drop zone · `FolderBrowser` + receipt rows · preview modal · sage-green accents |
| **Nav** | Enable **Receipts** in `moduleNav` → `/receipts` |
| **Codegen / tests** | Operations · unit tests for `FileStorage` path helpers · household auth on download |

**Not in Phase 1c:** OCR, metadata fields, search, finance linking, multi-file batch upload (unless owner confirms).

### 9.5 Task comments pass (awaiting owner GO)

| Layer | Work |
|-------|------|
| **Database** | `TaskComment` model · per-user read tracking · migration drops `Task.description` (no data migration) |
| **GraphQL** | Comment query/mutations · `commentCount` / `unreadCommentCount` on `Task` · remove description from Task inputs |
| **Web — sidebar** | Overlay right panel · thread (newest first) · compose · linkify URLs · close via X / outside click |
| **Web — entry** | Speech bubble on kanban card (bottom-right) and list row · count + unread badge |
| **Web — cleanup** | Remove description from kanban card, list columns, quick-add row |
| **Codegen / tests** | Operations · resolver auth (household + author delete) · unread logic unit tests |

**Not in v1:** comment edit, rich text, attachments, @mentions, live sync, push notifications (schema-ready only).

### 9.6 Gear inventory pass (Phase 1d — awaiting owner GO)

| Layer | Work |
|-------|------|
| **Database** | `FolderNamespace.GEAR` · `GearItem` (standalone) · `GearItemClass` + `GearVariant` · `GearLoan` + `GearLoanItem` · photo `storageKey` on item/variant · `GearCondition` enum incl. `RETIRED` |
| **API storage** | Reuse `FileStorage` for gear photos · upload + authenticated download routes |
| **GraphQL** | `gearLibrary` query (folders + items + classes) · CRUD mutations · `createLoan` / `markLoanReturned` / `clearLoanHistory` · move-to-folder |
| **Web `/gear`** | Library section (folders, items, class → variant table) · lend staging zone + form · active loans · collapsed history · muted-blue accents |
| **DnD** | Zone-aware: library (folders) + lend staging (items/variants only) · “Out on loan” badge blocks drag |
| **Nav** | Enable **Gear** in `moduleNav` → `/gear` |
| **Codegen / tests** | Operations · loan date validation · overdue display · cannot lend retired/on-loan items |

**Not in Phase 1d:** search/filter, promote standalone→class, partial returns, email reminders (schema-ready), mobile layout.

### 9.7 Finance Budget pass (Phase 1e — shipped)

| Layer | Work |
|-------|------|
| **Database** | `BudgetSection` (with `scope` `MONTHLY` \| `ANNUAL`) · `BudgetLineItem` · `BudgetLineSpend` (lineItemId, year, month — `0` = annual YTD) |
| **GraphQL** | `budgetMonth` → `monthlySections` + `annualSections` · section/line CRUD · computed spent/remaining/progress |
| **Web `/finance`** | `FinancePageLayout` + `FinanceViewToggle` · `BudgetTable` ×2 (monthly + collapsible annual) · `budget-scope.ts` config · sage accents |
| **Reuse** | `ModulePageLayout`, `sectionCardClass`, `EditableTextCell`, `ConfirmModal`, gear **+** / draft-row pattern |

### 9.8 Finance Budget purchases inbox (Phase 1f — awaiting owner GO)

| Layer | Work |
|-------|------|
| **Database** | `BudgetPurchase` (householdId, name, amountCents, purchaseDate, source `MANUAL` \| `VISA`, optional `externalTransactionId`) · `BudgetPurchaseAllocation` (purchaseId, lineItemId, amountCents) — allocations drive `BudgetLineSpend` |
| **GraphQL** | Extend `budgetMonth` with `purchases` inbox for current month (unassigned + partial remainders) · purchase CRUD · allocate / reassign / split mutations · update allocation amount · delete purchase/allocation · line-item `allocations` for sidebar |
| **Web `/finance/budget`** | `PurchasesInbox` (collapsible, scroll) · inline draft row + `CalendarPicker` · draggable purchase chips · drop targets on `BudgetLineItemRow` (both tables) · `BudgetPurchasesSidebar` (slide panel, allocation table, DnD reassign, inline amount edit) · **open** icon on line rows · over-budget remaining copy |
| **DnD** | `@dnd-kit` — inbox → line, sidebar → line; shared drag overlay pattern from Gear |
| **Reuse** | `BudgetTable`, `BudgetLineItemRow`, `CalendarPicker`, `TaskCommentsSidebar` shell, `ConfirmModal`, `formatCadCents`, existing spend rollup helpers |
| **Codegen / tests** | Operations · allocation sum invariant · spend roll-up monthly vs annual · split remainder · delete restores inbox · date-month notice |

**Not in Phase 1f:** Purchase List sub-page, auto-categorization, month browser for past purchases.

### 9.9 Finance Plaid credit-card sync (REQ-FIN-20)

| Layer | Work |
|-------|------|
| **Database** | `BankConnection` (encrypted access token, plaidItemId, syncCursor, status) · `BankAccount` (syncEnabled) · unique `(householdId, externalTransactionId)` on purchases |
| **Package** | `@life/plaid` — client, AES-GCM token crypto, transaction filters, sync |
| **GraphQL** | `bankConnections` · `createPlaidLinkToken` · `completePlaidLink` · `updateBankAccountSync` · `disconnectBankConnection` · `syncBankConnectionNow` · block delete of VISA purchases |
| **API cron** | Nightly `0 21 * * *` America/Los_Angeles |
| **Web** | `SyncCreditCardButton` + intro modal · `BankAccountSetupModal` · `BankSettingsButton` in Finance header · `react-plaid-link` |
| **Security** | Transactions product only · CA country codes · no bank passwords in app · encrypted tokens · persist Item to avoid re-link |

---

## 10. Design assets

| Asset | File | Notes |
|-------|------|-------|
| Kanban (expanded sidebar) | [`Kanban_full_sidebar_homepage.png`](Kanban_full_sidebar_homepage.png) | Light sidebar in mockup — **implement dark** |
| Kanban (collapsed sidebar) | [`Kanban_collapsed_sidebar_homepage.png`](Kanban_collapsed_sidebar_homepage.png) | Icon rail reference |
| List view | [`list_view_homepage.png`](list_view_homepage.png) | Table + Kanban/List toggle |
| Token spec | `DESIGN.md` (this file) | YAML frontmatter = implementation tokens |

**Mockup deltas from implementation spec:**

| Mockup shows | We implement |
|--------------|--------------|
| “Hearth Home” | **Life Management** |
| Light sidebar | **Dark evergreen** sidebar |
| Sidebar “+ New Entry” | **“+ New Task”** on Tasks header |
| Assignee/Priority filters | **Deferred** |
| Category subtext + left bar | **Deferred** |
| Settings + ADMIN footer | **Deferred** |
| 4 kanban columns (no DONE) | 4 status columns + collapsible DONE |
| Task description on cards/list | **Comment thread sidebar** (§8.13) |

---

## 11. Requirements cross-reference

| Design area | Requirement IDs |
|-------------|-----------------|
| Default home (Kanban) | REQ-SHELL-01 |
| Module sidebar | REQ-SHELL-03 |
| Responsive + mobile | REQ-SHELL-02, NFR-PERF-02 |
| Kanban + List | REQ-TASK-12, REQ-TASK-14, REQ-TASK-06, REQ-TASK-07 |
| Task comments | REQ-TASK-08 … REQ-TASK-09, REQ-TASK-21 … REQ-TASK-23 · §8.13 |
| Later task views | REQ-TASK-10, REQ-TASK-11, REQ-TASK-13 |
| Task filters (later) | REQ-TASK-15 |
| Multi-assignee | REQ-TASK-05 |
| Task fields | REQ-TASK-01 … REQ-TASK-04 |
| Push reminders (UI) | REQ-TASK-20 |
| Finance Budget | REQ-FIN-07 … REQ-FIN-16, REQ-FIN-17 … REQ-FIN-26, REQ-FIN-20 |
| Google Calendar | REQ-CAL-01 … REQ-CAL-04 |
| Meals | REQ-MEAL-01 … REQ-MEAL-08 |
| Receipts | REQ-RCPT-01 … REQ-RCPT-13 |
| Gear | REQ-GEAR-01 … REQ-GEAR-19 · §8.14 |
| Shared folders | REQ-FOLDER-01 … REQ-FOLDER-06 |
| Out of scope | Dark mode, a11y-specific, real-time collab (§3.2) |

---

## 12. Changelog

| Date | Change |
|------|--------|
| 2026-07-10 | **Recipe URL import (REQ-MEAL-09):** §8.10 Import from URL via Schema.org JSON-LD (`@life/recipe-import`). |
| 2026-07-10 | **Plaid credit-card sync (REQ-FIN-20):** §8.8.1 bank sync UX; implementation plan §9.9. |
| 2026-07-08 | **Finance Budget purchases inbox (Phase 1f):** §8.8 restructured (§8.8.1 inbox + §8.8.2 tables); purchases DnD/splitting, sidebar, `CalendarPicker`, scoped sections doc sync. Implementation plan §9.8 (awaiting owner GO). REQ-FIN-17 … REQ-FIN-26. |
| 2026-07-07 | **Finance Budget V1 (Phase 1e):** §8.8 budget tables, in-module nav, separate monthly/annual tables, sage accent. Implementation plan §9.7 (shipped). |
| 2026-07-06 | **Gear inventory (Phase 1d):** §8.14 standalone items + item classes/variants, photos, lending staging + active loans + history; `GEAR` folder namespace. Implementation plan §9.6 (awaiting owner GO). |
| 2026-07-02 | **Task comments:** §8.13 overlay sidebar thread (newest-first, linkify, unread + count, author delete); remove description (REQ-TASK-09). Status columns → TODO / IN_PROGRESS / WAITING / DONE. Implementation plan §9.5 (awaiting GO). |
| 2026-07-02 | **Receipt management (Phase 1c):** §8.11 upload/preview/rename/delete, sage accent, `/receipts` nav. **Shared folders:** §8.12 — `FolderBrowser`, migrate meals off `RecipeFolder`. Implementation plan §9.4. |
| 2026-06-24 | Meal planning refinements: recipe modal, PST Sunday cron (slots only), grocery Bought + Remove bought, delete-recipe clears slots, multi-qty merge row |
| 2026-06-25 | Mockup review: module nav, Kanban default, List toggle, statuses, multi-assignee, DnD, collapsible DONE; linked PNG assets; first UI pass scope; aligned `requirements.md` |
| 2026-06-24 | Initial Stitch/Kinship export |
| 2026-06-24 | Resolved naming, sidebar, nav, color, and Phase 1 scope decisions |
