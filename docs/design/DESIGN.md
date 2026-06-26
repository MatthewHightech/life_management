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
| Meal Planning nav | Top-level — disabled until Phase 1b | REQ-MEAL-01 |
| Create action | **"+ New Task"** on Tasks pages (not sidebar “+ New Entry”) | — |
| Kanban columns | BACKLOG · TODO · IN_PROGRESS · WAITING · **DONE** (collapsible, hidden by default) | REQ-TASK-06 |
| Kanban interaction | **Drag-and-drop** between columns updates status | REQ-TASK-07 |
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
- **Top border accent** colored by **column status** (grey backlog, blue todo, orange in-progress, red waiting).
- **Priority chip** (pill) bottom-right: amber/red tint for HIGH/URGENT; muted for LOW/MEDIUM.
- **Assignee avatars** bottom-left (stacked when multiple).
- **Subtask progress** optional: “N% complete” + bar when subtasks exist.
- Drag between columns → status update.

**Tasks — List (first pass):**

- Table columns: Task name · Status · Priority · Assignee(s) · Due date.
- Status/priority as pills; overdue row gets soft red background (per mockup).
- **No** category subtext or left color bar in first pass.
- Toggle with Kanban in Tasks header.

**Tasks — deferred styling:**

- Category subtext (“Finance & Documentation”) and project-colored left bars → use `TaskProject` in a later pass.
- Module-colored top borders on cards → not used on task cards.

**Finance / Calendar / Meals (when built):**

- Use module background tints (sage, blue, amber) for section headers, summary cards, and category chips on those screens only.
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
  Finance        →  /finance        (disabled until Phase 1)
  Calendar       →  /calendar       (disabled — Google Calendar module)
  Meal Planning  →  /meals          (disabled until Phase 1b)
  ─────────────────
  Sign out
  [User — name + avatar only; no Settings or ADMIN badge in first pass]

[Collapsed: 72px icon rail — “LM” or household initial logo]
```

**Inside Tasks module** (`/tasks`, default Kanban):

```
Header:  Tasks                    [+ New Task]
         [Kanban] [List]          ← view toggle (segmented control)

Kanban:  BACKLOG | TODO | IN-PROGRESS | WAITING | [▸ DONE collapsed]
List:    filter chips deferred (REQ-TASK-15)
```

| Route | View | Status |
|-------|------|--------|
| `/` or `/tasks` | Kanban (default) | **First UI pass** |
| `/tasks/list` | List table | **First UI pass** |
| `/tasks/today` | Today / inbox | Later pass |
| `/tasks/calendar` | Task due-date calendar | Later pass |
| `/tasks/people` | By assignee | Later pass |

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
- DONE column collapsible — collapsed by default; expand to see completed tasks.
- `WAITING` aligns with blocked/waiting-on-dependency workflow (REQ-TASK-04).

### 8.3 List view

Reference: [`list_view_homepage.png`](list_view_homepage.png)

- Sortable table layout inside Tasks module.
- Overdue: light red row background + red due date (soft, not harsh).
- FAB with edit icon — **optional for first pass**; “+ New Task” in header is required.

### 8.4 Task cards (shared)

- White surface, Level 1 border.
- Priority chip + assignee avatar(s).
- Hover → Level 2 elevation.

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

### 8.8 Finance tables (future)

- Monospaced numerals, right-aligned amounts.
- Sage module tint on summary/header cards.
- Category spend bars using category color or sage scale.

### 8.9 Calendar views (future)

- **Task calendar:** due-date grouping (current implementation direction).
- **Google Calendar:** separate Events UI; muted-blue module tint; read/write per REQ-CAL-02/03.

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
| **Finance** | Budget dashboard (sage accent) |
| **Calendar** | Google Calendar module (blue accent) |
| **Meals** | Meal planning (Phase 1b) |
| **Deferred** | Dark mode · Settings · admin roles UI |

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
| 4 kanban columns (no DONE) | 5 columns; **DONE collapsible** |

---

## 11. Requirements cross-reference

| Design area | Requirement IDs |
|-------------|-----------------|
| Default home (Kanban) | REQ-SHELL-01 |
| Module sidebar | REQ-SHELL-03 |
| Responsive + mobile | REQ-SHELL-02, NFR-PERF-02 |
| Kanban + List | REQ-TASK-12, REQ-TASK-14, REQ-TASK-06, REQ-TASK-07 |
| Later task views | REQ-TASK-10, REQ-TASK-11, REQ-TASK-13 |
| Task filters (later) | REQ-TASK-15 |
| Multi-assignee | REQ-TASK-05 |
| Task fields | REQ-TASK-01 … REQ-TASK-04 |
| Push reminders (UI) | REQ-TASK-20 |
| Finance | REQ-FIN-01 … REQ-FIN-06 |
| Google Calendar | REQ-CAL-01 … REQ-CAL-04 |
| Meals | REQ-MEAL-01, REQ-MEAL-02 |
| Out of scope | Dark mode, a11y-specific, real-time collab (§3.2) |

---

## 12. Changelog

| Date | Change |
|------|--------|
| 2026-06-25 | Mockup review: module nav, Kanban default, List toggle, statuses, multi-assignee, DnD, collapsible DONE; linked PNG assets; first UI pass scope; aligned `requirements.md` |
| 2026-06-24 | Initial Stitch/Kinship export |
| 2026-06-24 | Resolved naming, sidebar, nav, color, and Phase 1 scope decisions |
