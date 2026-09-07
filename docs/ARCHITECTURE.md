# Architecture — Booran Warranty Evidence Capture System

## Overview

The Booran Warranty Evidence Capture System is a multi-tier platform consisting of:

- **One unified Next.js web application** (`frontend/web`) with Role-Based Access Control (RBAC)
- **One NestJS REST API backend** (`backend/api`)
- **MongoDB database** (MongoDB Atlas with Mongoose ODM)
- **Future mobile application** (`mobile/` for iOS/Android evidence capture)

All frontend clients communicate with the backend exclusively through REST APIs. There is no shared server-side code between frontend and backend.

## System Architecture

```
┌────────────────────────────────────────────────────────┐     ┌─────────────────────┐
│             Unified Web Portal (Next.js)              │     │  Mobile App         │
│             frontend/web                              │     │  (Future)           │
│             Port: 3000                                │     │                     │
│  [ADMIN]  [OPERATIONS]                                │     │                     │
└───────────────────────────┬────────────────────────────┘     └──────────┬──────────┘
                            │                                             │
                            │             REST API (HTTP/HTTPS)           │
                            ▼                                             ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             NestJS REST API                                      │
│                             Port: 4000                                           │
│                             Prefix: /api/v1                                      │
│                                                                                  │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐               │
│   │  Auth    │ │  Users   │ │Warranties│ │  Cases   │ │ Evidence │               │
│   │ Module   │ │ Module   │ │ Module   │ │ Module   │ │ Module   │               │
│   └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘               │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐               │
│   │ Reviews  │ │  Tasks   │ │  Notif.  │ │ Reports  │ │  Audit   │               │
│   │ Module   │ │ Module   │ │ Module   │ │ Module   │ │ Module   │               │
│   └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘               │
└────────────────────────────────────┬─────────────────────────────────────────────┘
                                     │
                                     │  Mongoose ODM
                                     ▼
                        ┌─────────────────────────┐
                        │     MongoDB Atlas       │
                        │                         │
                        └─────────────────────────┘
```

## RBAC Model & Roles

The system operates with strictly **TWO** primary roles:

| Role | Target Users | Accessible Modules | Key Capabilities |
|---|---|---|---|
| **ADMIN** | System Administrators | Dashboard, Users, Warranties, Cases, Evidence, Reviews, Tasks, Reports, Audit Logs, Settings | Full administrative management, user provisioning, global settings, audit inspection |
| **OPERATIONS** | Warranty & Dispatch Ops | Dashboard, Warranties, Cases, Evidence, Reviews, Tasks | Warranty policy creation, claims processing, technician task dispatching |


## Application Structure

### Unified Web Application (`frontend/web`)

- **Port:** 3000
- **AppShell:** Shared Header, dynamic Sidebar, and Content view.
- **Routing:** Centralized `/dashboard` route dynamically adapts to current user role.
- **Security:** `ProtectedRoute` and `PermissionGate` protect unauthorized routes (403 Forbidden).

### Backend API (`backend/api`)

- **Port:** 4000
- **API Prefix:** `/api/v1`
- **Database:** MongoDB Atlas via `@nestjs/mongoose`
- **Health Check:** `GET /api/v1/health`

## Environment Configuration

| Variable | Application | Description |
|---|---|---|
| `NODE_ENV` | Backend | Environment (development/production) |
| `PORT` | Backend | API server port (default 4000) |
| `MONGODB_URI` | Backend | MongoDB Atlas connection string |
| `FRONTEND_WEB_URL` | Backend | Web portal URL for CORS (default http://localhost:3000) |
| `NEXT_PUBLIC_API_URL` | Frontend | Backend API base URL (default http://localhost:4000/api/v1) |

## Directory Structure

```text
booran/
├── backend/
│   ├── api/
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── common/          # Shared utilities, filters, interfaces
│   │   │   ├── config/          # App configuration
│   │   │   ├── database/        # MongoDB/Mongoose setup
│   │   │   └── modules/         # Business modules (Phase 2+)
│   │   ├── .env
│   │   ├── .env.example
│   │   └── package.json
│   └── package.json             # Backend script delegation
│
├── frontend/
│   ├── web/                     # Unified RBAC Web Portal
│   │   ├── src/
│   │   │   ├── app/             # Next.js App Router (dashboard, users, etc.)
│   │   │   ├── components/      # Shared AppShell, UI, Auth gates
│   │   │   ├── context/         # AuthContext
│   │   │   ├── lib/             # Permissions, Navigation, API client
│   │   │   └── types/           # RBAC & User types
│   │   ├── .env.local
│   │   ├── .env.example
│   │   └── package.json
│   └── package.json             # Frontend script delegation
│
├── docs/
│   └── ARCHITECTURE.md
│
├── .gitignore
├── README.md
└── package.json                 # Root script runner
```
