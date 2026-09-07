# Booran Warranty Evidence Capture System — Phase 3 Documentation

## Phase 3: Detailed Web Portal UI & Reusable Component System

### 1. Overview
Phase 3 transitions the Booran Warranty Evidence Capture System into a production-grade, enterprise SaaS web portal. It implements a complete design system, comprehensive data tables with search and multi-criteria filters, interactive modals, detailed record workspaces, and role-based views.

All UI screens consume strongly-typed mock repositories (`src/lib/mock/`) structured so that NestJS REST APIs can be connected in subsequent phases with zero component refactoring.

---

### 2. Architecture & RBAC Governance

* **Unified Web Application**: Single Next.js portal located in `frontend/web/`.
* **Two Roles Only**:
  * **`ADMIN`**: Executive governance, user management, audit logs, system preferences, and reports.
  * **`OPERATIONS`**: Warranty policy lookups, claim intake, evidence capture, task dispatch, and review queues.
* **Authentication Split**:
  * **Supabase Auth**: Manages credentials, passwords, JWT tokens, session lifecycle, and passkeys.
  * **MongoDB Atlas**: Stores application profile, role, and domain records (`users`, `warranties`, `cases`, `evidence`, etc.).
  * **NestJS REST API**: Enforces RBAC permissions on all endpoints.

---

### 3. Portal Route Inventory

| Route | Permitted Roles | Description |
| :--- | :--- | :--- |
| **`/login`** | Public | Supabase authentication entry point with demo shortcuts |
| **`/dashboard`** | `ADMIN`, `OPERATIONS` | Role-aware dashboard (Executive KPIs for Admin, Claims/Tasks for Operations) |
| **`/users`** | `ADMIN` only | User management table, search, role filters, and add user modal |
| **`/users/[id]`** | `ADMIN` only | Detailed user profile, Supabase UID, and active permissions matrix |
| **`/warranties`** | `ADMIN`, `OPERATIONS` | Policy directory, coverage levels, VIN lookups, and policy registration modal |
| **`/warranties/[id]`** | `ADMIN`, `OPERATIONS` | Vehicle specs, customer information, coverage terms, and related claims |
| **`/cases`** | `ADMIN`, `OPERATIONS` | Claims workspace, priority/status filters, and claim intake modal |
| **`/cases/[id]`** | `ADMIN`, `OPERATIONS` | Tabbed claim workspace (Overview, Evidence, Tasks, Reviews, Activity) |
| **`/evidence`** | `ADMIN`, `OPERATIONS` | Diagnostic photo/video/scan registry, status filters, and capture modal |
| **`/evidence/[id]`** | `ADMIN`, `OPERATIONS` | Evidence inspector, high-res attachment gallery, and reviewer notes |
| **`/reviews`** | `ADMIN`, `OPERATIONS` | Review queue, verification workflow, and interactive sign-off modal |
| **`/reviews/[id]`** | `ADMIN`, `OPERATIONS` | Detailed underwriting review workspace with Approve/Decline/Request Info controls |
| **`/tasks`** | `ADMIN`, `OPERATIONS` | Operational checklist, technician dispatch, due dates, and completion toggles |
| **`/tasks/[id]`** | `ADMIN`, `OPERATIONS` | Step-by-step task checklist workspace and status transitions |
| **`/reports`** | `ADMIN` only | Executive analytics, claim volume trends, defect breakdown, and export actions |
| **`/audit-logs`** | `ADMIN` only | Immutable audit log trail with entity filters and IP address tracking |
| **`/settings`** | `ADMIN` only | Profile, pagination preferences, SLA turnaround thresholds, and RBAC security |

---

### 4. Component Hierarchy & Reusability

All screens utilize shared, accessible design system components in `frontend/web/src/components/ui/`:

* **`DataTable<T>`**: Generic, typed data table with column rendering, clickable rows, loading skeleton, and empty states.
* **`StatusBadge`**: Normalized status styling for all entities (`ACTIVE`, `PENDING`, `APPROVED`, `REJECTED`, `OPEN`, `URGENT`, etc.).
* **`SearchInput`**: Debounced search bar with clear button and keyboard access.
* **`FilterSelect`**: Multi-select dropdown filtering.
* **`Pagination`**: Item count display, page size control, and page navigation.
* **`PageHeader`**: Standardized title, subtitle, breadcrumb navigation, and contextual action buttons.
* **`StatCard`**: Metric cards with icon badges and trend indicators.
* **`Tabs`**: Accessible tab switcher for complex detail views.
* **`Modal` & `ConfirmDialog`**: Accessible overlays with danger and confirmation variations.
* **`Button`**: Standardized variants (`primary`, `secondary`, `outline`, `ghost`, `destructive`).

---

### 5. Mock Data Strategy (`src/lib/mock/`)

Mock data is completely decoupled from UI components and resides under `src/lib/mock/`:
* `users.ts`: Seeded administrative and operational staff.
* `warranties.ts`: Realistic automotive warranty policies (Ford, Toyota, Audi, Isuzu).
* `cases.ts`: Detailed warranty defect claims with diagnostic descriptions and cost estimates.
* `evidence.ts`: Evidence items across photographic, video, and diagnostic log formats.
* `reviews.ts`: Pending and completed underwriting reviews.
* `tasks.ts`: Road tests, teardown inspections, and parts procurement tasks.
* `auditLogs.ts`: System activity records.
* `reports.ts`: Aggregated KPIs, monthly trends, and defect distributions.

In Phase 4/5, these mock datasets will be seamlessly replaced by frontend API service calls (`src/lib/api/`) connecting to the NestJS backend without modifying any component templates.

---

### 6. Verification & Test Report

* **ESLint**: Passed with 0 errors across all files (`npm run lint:all`).
* **Next.js Turbopack Build**: Compiled and generated all 17 routes with zero TypeScript errors (`npm run build:all`).
* **Supabase Handshake**: Maintained existing credentials and session handlers.
* **Database Connection**: Live MongoDB Atlas connectivity confirmed via `npm run test:db`.
