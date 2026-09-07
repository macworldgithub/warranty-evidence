# Booran Warranty Evidence Capture System

A comprehensive warranty evidence capture and management platform built for Booran.

## Project Structure

```
booran/
├── backend/
│   └── api/              → NestJS REST API
├── frontend/
│   ├── admin/            → Admin Web Portal (Next.js)
│   └── operations/       → Operations Web Portal (Next.js)
└── docs/                 → Architecture & documentation
```

## Technology Stack

### Backend
- **Runtime:** Node.js
- **Framework:** NestJS
- **Language:** TypeScript
- **Database:** MongoDB
- **ODM:** Mongoose
- **API Style:** REST

### Frontend
- **Framework:** Next.js (App Router)
- **UI Library:** React
- **Language:** TypeScript
- **Styling:** Tailwind CSS

## Development URLs

| Application | URL |
|---|---|
| Admin Portal | http://localhost:3000 |
| Operations Portal | http://localhost:3001 |
| API | http://localhost:4000 |
| API Health | http://localhost:4000/api/v1/health |

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm 9+
- MongoDB (optional for initial UI development)

### Install All Dependencies

```bash
# From the root directory
npm run install:all

# Or install individually
cd backend/api && npm install
cd frontend/admin && npm install
cd frontend/operations && npm install
```

### Run All Applications

Open three terminal windows:

**Terminal 1 — Backend API:**
```bash
cd backend/api
npm run start:dev
```

**Terminal 2 — Admin Portal:**
```bash
cd frontend/admin
npm run dev
```

**Terminal 3 — Operations Portal:**
```bash
cd frontend/operations
npm run dev -- -p 3001
```

### Using Root Scripts

```bash
# From the root directory
npm run dev:api        # Start backend
npm run dev:admin      # Start admin portal
npm run dev:ops        # Start operations portal
```

### Build

```bash
cd backend/api && npm run build
cd frontend/admin && npm run build
cd frontend/operations && npm run build
```

### Lint

```bash
cd backend/api && npm run lint
cd frontend/admin && npm run lint
cd frontend/operations && npm run lint
```

## Environment Configuration

Each application has a `.env.example` file. Copy it to `.env` and configure as needed:

```bash
cp backend/api/.env.example backend/api/.env
cp frontend/admin/.env.example frontend/admin/.env
cp frontend/operations/.env.example frontend/operations/.env
```

> **Warning:** Never commit `.env` files. They are included in `.gitignore`.

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed architecture documentation.

## Phase Roadmap

- **Phase 1:** Project foundation (current)
- **Phase 2+:** Authentication, business modules, mobile app
