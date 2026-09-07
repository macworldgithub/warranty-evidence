# Architecture — Booran Warranty Evidence Capture System

## Overview

The Booran Warranty Evidence Capture System is a multi-tier platform consisting of:

- **Authentication & Sessions**: **Supabase Auth**
- **Application Database**: **MongoDB Atlas** (with Mongoose ODM)
- **Business Logic & Authorization/RBAC**: **NestJS REST API** (`backend/api`)
- **Web Portal**: **Single Unified Next.js Web Portal** (`frontend/web`)
- **Future Mobile Application**: **React Native / Expo** (`mobile/`) consuming the same NestJS API

> [!NOTE]
> **Supabase is used for Authentication only** (password security, JWT token issuance, session refresh). Supabase is **NOT** the primary application database. MongoDB Atlas remains the system of record for application users, warranties, cases, and evidence.

---

## Authentication & Authorization Architecture

```text
                    ┌─────────────────────┐
                    │   Next.js Web App   │
                    │   Single Portal     │
                    └──────────┬──────────┘
                               │
                               │ 1. Login (Email + Password)
                               ▼
                    ┌─────────────────────┐
                    │    Supabase Auth    │
                    │                     │
                    │ Authentication      │
                    │ Sessions            │
                    │ Password Security   │
                    └──────────┬──────────┘
                               │
                               │ 2. Issues Supabase Access Token (JWT)
                               ▼
                    ┌─────────────────────┐
                    │    NestJS API       │
                    │    Port: 4000       │
                    │                     │
                    │ Verify Supabase JWT │
                    │ SupabaseAuthGuard   │
                    │ PermissionsGuard    │
                    └──────────┬──────────┘
                               │
                               │ 3. Fetch user role & permissions
                               ▼
                    ┌─────────────────────┐
                    │    MongoDB Atlas    │
                    │                     │
                    │ Application Users   │
                    │ Role: ADMIN / OPS   │
                    │ Status: ACTIVE      │
                    │ Warranties, Cases   │
                    └─────────────────────┘
```

---

## RBAC Model & Roles

The system operates with strictly **TWO** primary roles:

| Role | Target Users | Accessible Modules | Key Capabilities |
|---|---|---|---|
| **ADMIN** | System Administrators | Dashboard, Users, Warranties, Cases, Evidence, Reviews, Tasks, Reports, Audit Logs, Settings | Full administrative management, user provisioning, global settings, audit inspection |
| **OPERATIONS** | Warranty & Dispatch Ops | Dashboard, Warranties, Cases, Evidence, Reviews, Tasks | Warranty policy creation, claims processing, technician task dispatching |

---

## Authenticated User Flow

```text
1. User enters Email and Password on /login
2. Supabase Auth authenticates credentials and returns an Access Token (JWT)
3. Frontend attaches token: Authorization: Bearer <access_token>
4. NestJS SupabaseAuthGuard verifies the JWT token
5. Extracts supabaseUserId and queries MongoDB for the application user
6. Verifies status === 'ACTIVE' (rejects INACTIVE or SUSPENDED users with 401)
7. Reads role (ADMIN vs OPERATIONS) from MongoDB (source of truth)
8. Computes granular permissions for the user
9. PermissionsGuard enforces @RequirePermissions(...) on protected endpoints
10. Frontend receives user profile from GET /api/v1/auth/me and updates AppShell navigation
```

---

## Environment Configuration

### Backend (`backend/api/.env`)
| Variable | Description |
|---|---|
| `NODE_ENV` | Environment (`development` / `production`) |
| `PORT` | API server port (default `4000`) |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `SUPABASE_URL` | Supabase project URL (`https://<project-ref>.supabase.co`) |
| `SUPABASE_ANON_KEY` | Supabase anonymous API key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only Supabase service-role key (NEVER expose to frontend) |
| `FRONTEND_WEB_URL` | Web portal URL for CORS (default `http://localhost:3000`) |
| `SEED_ADMIN_EMAIL` | Development seed admin email (`admin@booran.com`) |
| `SEED_OPERATIONS_EMAIL` | Development seed operations email (`ops@booran.com`) |

### Frontend (`frontend/web/.env.local`)
| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous public key |
| `NEXT_PUBLIC_API_URL` | Backend REST API URL (`http://localhost:4000/api/v1`) |

---

## Directory Structure

```text
booran/
├── backend/
│   ├── api/
│   │   ├── src/
│   │   │   ├── auth/
│   │   │   │   ├── guards/
│   │   │   │   │   ├── supabase-auth.guard.ts
│   │   │   │   │   └── permissions.guard.ts
│   │   │   │   ├── decorators/
│   │   │   │   │   ├── current-user.decorator.ts
│   │   │   │   │   └── require-permissions.decorator.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── auth.controller.ts
│   │   │   │   └── auth.module.ts
│   │   │   ├── users/
│   │   │   │   ├── schemas/
│   │   │   │   │   └── user.schema.ts
│   │   │   │   ├── users.service.ts
│   │   │   │   ├── users.controller.ts
│   │   │   │   └── users.module.ts
│   │   │   ├── database/
│   │   │   │   ├── database.module.ts
│   │   │   │   └── seed.ts
│   │   │   ├── common/
│   │   │   └── main.ts
│   │   ├── .env
│   │   └── package.json
│   └── package.json
│
├── frontend/
│   ├── web/
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── login/
│   │   │   │   ├── dashboard/
│   │   │   │   └── ... (users, warranties, cases, etc.)
│   │   │   ├── components/
│   │   │   │   ├── layout/ (AppShell, Sidebar, Header)
│   │   │   │   ├── auth/ (ProtectedRoute, PermissionGate)
│   │   │   │   └── ui/
│   │   │   ├── context/
│   │   │   │   └── AuthContext.tsx
│   │   │   ├── lib/
│   │   │   │   ├── supabase/client.ts
│   │   │   │   ├── api.ts
│   │   │   │   └── permissions.ts
│   │   │   └── types/
│   │   ├── .env.local
│   │   └── package.json
│   └── package.json
│
├── docs/
│   ├── ARCHITECTURE.md
│   └── PHASE_3.md
│
├── .gitignore
├── README.md
└── package.json
```

---

## Phase 3 — Detailed Web Portal UI

Phase 3 established the full enterprise UI layout for the unified web portal across all 10 core modules:

* **Reusable Design System**: Standardized `DataTable`, `StatusBadge`, `PageHeader`, `StatCard`, `SearchInput`, `FilterSelect`, `Pagination`, `Tabs`, `Modal`, `ConfirmDialog`, and `Button` components.
* **Decoupled Mock Repository**: Strongly-typed mock repositories in `src/lib/mock/` providing realistic data for warranties, defect cases, evidence items, tasks, and audit logs.
* **Role-Specific Dashboard**: Distinct, tailored views for `ADMIN` (executive KPIs, review queues, audit trail) and `OPERATIONS` (active claims, tasks checklist, evidence intake).
* **Workspace Workspaces**: Rich multi-tab workspaces for claims (`/cases/[id]`), evidence inspection (`/evidence/[id]`), and underwriting review decisions (`/reviews/[id]`).

