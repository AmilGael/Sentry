# Re-Entry — Resident Management & Employment Pass System

A web-based case management system for residential re-entry facilities. Digitizes employment authorization workflows, generates cryptographically signed movement passes, and provides real-time Front Desk monitoring.

See **Re-Entry_PRD.md** for the full product requirements document.

## Tech Stack

- **Framework:** Next.js 16 (App Router, TypeScript)
- **Styling:** Tailwind CSS 4
- **Database:** PostgreSQL 15+
- **ORM:** Prisma 7
- **Auth:** NextAuth.js (Auth.js v5)
- **Real-Time:** WebSocket (planned — Phase 7)
- **Crypto:** Node.js `crypto` module (HMAC-SHA256)

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 15+ (local or hosted)

### Setup

```bash
# Install dependencies
npm install

# Copy environment variables and configure
cp .env.example .env
# Edit .env with your database URL and secrets

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed the database with sample data
npm run db:seed

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Seed Data Credentials

All seed users share the same password: `Password123!`

| Role                  | Email                        | Name             |
|-----------------------|------------------------------|------------------|
| Admin                 | admin@reentry.local          | Diana Torres     |
| Case Manager          | cm.williams@reentry.local    | Marcus Williams  |
| Case Manager          | cm.chen@reentry.local        | Lisa Chen        |
| Employment Specialist | es.grant@reentry.local       | Robert Grant     |
| Front Desk            | fd.jackson@reentry.local     | Angela Jackson   |
| Front Desk            | fd.martinez@reentry.local    | Carlos Martinez  |

### Database Commands

```bash
npm run db:generate   # Regenerate Prisma client after schema changes
npm run db:migrate    # Create and apply a new migration
npm run db:push       # Push schema to DB without migration (dev only)
npm run db:seed       # Run seed script
npm run db:studio     # Open Prisma Studio (visual DB browser)
npm run db:reset      # Reset DB and re-seed
```

## Build Phases

| Phase | Description                                              | Status      |
|-------|----------------------------------------------------------|-------------|
| 1     | Project scaffold, database schema, seed data             | ✅ Complete |
| 2     | Authentication with role-based access                    | ✅ Complete |
| 3     | Resident management (CRUD, status tracking)              | ✅ Complete |
| 4     | Employment authorization workflow                        | ✅ Complete |
| 5     | Movement pass generation, QR codes, HMAC signing         | ✅ Complete |
| 6     | QR code generation and pass delivery                     | ✅ Complete |
| 7     | Front Desk dashboard with real-time updates              | Pending     |
| 8     | Incident reporting (automatic and manual)                | Pending     |
| 9     | Reporting and analytics                                  | Pending     |
| 10    | Admin configuration panel                                | Pending     |
| 11    | Polish, accessibility audit, performance optimization    | Pending     |
