# Sentry — Re-Entry Resident Management & Employment Pass System

A web-based case management system for residential re-entry facilities. Digitizes employment authorization workflows, generates cryptographically signed movement passes, and provides real-time Front Desk monitoring — replacing paper work passes with a QR-verified system that makes unauthorized leave impossible to hide.

See `Re-Entry_PRD.md` for the full product requirements document.

## Tech Stack
- **Framework:** Next.js 16 (App Router, TypeScript)
- **Styling:** Tailwind CSS 4
- **Database:** PostgreSQL 15+
- **ORM:** Prisma 7
- **Auth:** NextAuth.js (Auth.js v5) — role-based access
- **Real-Time:** WebSocket
- **Crypto:** Node.js `crypto` module (HMAC-SHA256) for signed passes

## What I Built
- Designed the **Prisma schema** for residents, employment authorizations, movement passes, and incidents
- Built **resident management** (CRUD, status tracking) and the **employment authorization workflow**
- Implemented **HMAC-SHA256 movement pass generation** with QR code delivery
- Built the **Front Desk dashboard** — QR scanning, verification, and offline fallback
- Added **incident reporting** (automatic on pass violation + manual entry)
- Implemented **role-based auth** (Admin, Case Manager, Employment Specialist, Front Desk)

## Key Features
- Cryptographically signed, QR-verified movement passes
- Real-time Front Desk dashboard
- Role-based access control with four distinct user roles
- Automatic incident generation on unauthorized movement
- Reporting and analytics module

## How to Run
**Prerequisites:** Node.js 20+, PostgreSQL 15+

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database URL and secrets

# Generate Prisma client and run migrations
npm run db:generate
npm run db:migrate
npm run db:seed

# Start the dev server
npm run dev
```

Open http://localhost:3000.

### Seed Credentials
All seed users share password: `Password123!`

| Role | Email |
|------|-------|
| Admin | admin@reentry.local |
| Case Manager | cm.williams@reentry.local |
| Employment Specialist | es.grant@reentry.local |
| Front Desk | fd.jackson@reentry.local |

### Database Commands
```bash
npm run db:generate  # Regenerate Prisma client
npm run db:migrate   # Create and apply a new migration
npm run db:push      # Push schema without migration (dev only)
npm run db:seed      # Run seed script
npm run db:studio    # Open Prisma Studio
npm run db:reset     # Reset DB and re-seed
```

## Screenshots
_Add screenshots of: Front Desk dashboard, movement pass QR, resident detail, incident feed._

## Build Phases
All core phases (1–10) complete. Phase 11 (polish, accessibility audit, performance) in progress.

## License
MIT
