# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Vulcan is a mobile marketplace MVP ("Airbnb for Skilled Hands") connecting Bookers with workshop Hosts. Two separate apps live side-by-side: `app/` (Expo React Native frontend) and `backend/` (Express API). Not a monorepo — each has independent `package.json`, `node_modules`, and `.env`.

## Commands

### Backend (`backend/`)
```bash
npm run dev              # Start with watch mode (tsx watch src/app.ts)
npm run build            # TypeScript compile
npm run db:push          # Sync Prisma schema to Supabase
npm run db:seed          # Seed lookup + mock data
npm run db:reset         # Drop all, re-push schema, re-seed
npm run db:studio        # Prisma Studio GUI
```

### Frontend (`app/`)
```bash
npx expo start           # Dev server
npx expo run:android     # Dev build (required — not Expo Go)
npx expo run:ios         # Dev build iOS
```

**Both must run simultaneously for development:** backend on port 3000, then Expo dev server.

## Architecture

### Frontend (`app/`)
- **Routing:** Expo Router (file-based). Tab nav in `app/(tabs)/`, dynamic routes for `workshop/[id]`, `booking/[workshopId]`, `snapshot/[projectId]`.
- **State:** Zustand (`lib/store.ts`) for auth + cached lookups; React Query hooks (`hooks/`) for server state.
- **API layer:** Custom fetch wrapper in `lib/api.ts`, base URL from `EXPO_PUBLIC_API_URL`.
- **Types:** All in `types/index.ts`, matching Prisma snake_case DB output.
- **Init flow:** Root `_layout.tsx` calls `useStore.initialize()` → fetches session + `/api/lookups/all` into Zustand.

### Backend (`backend/`)
- **Entry:** `src/app.ts` — Express with CORS, routes mounted at `/api/*`.
- **Routes:** `src/routes/` organized by domain: `lookups`, `workshops`, `bookings`, `snapshots`.
- **DB:** Prisma ORM → Supabase PostgreSQL. Schema in `prisma/schema.prisma` (16 models). Seed in `prisma/seed.ts`.
- **Supabase client:** `src/lib/supabase.ts` used for REST queries alongside Prisma.

### Key API endpoints
- `GET /api/lookups/all` — all lookups in one call (cached on app init)
- `GET /api/workshops?lat=&lng=&radius=&equipment=&category=` — geo + filter search
- `POST /api/bookings` — validates safety rules, slot availability, calculates price
- `POST /api/snapshots/projects/:projectId/snapshots` — requires before + after photos

## Domain rules

- **Lookups are DB-driven, never hardcoded.** Frontend fetches from API, caches in Zustand.
- **Safety rules:** 3 platform-wide rules enforced at booking time (`constants/safety-rules.ts`).
- **Snapshot enforcement:** Both before and after photos required. Host cannot mark booking COMPLETED without snapshots.
- **Pricing:** `totalPrice = hourlyRate + sum(addon prices)`. `priceAtBooking` frozen at purchase time.
- **Geo search:** Bounding-box approximation, not PostGIS. All mock data uses Wichita, KS coordinates.
- **Cancellation:** Free if >24h away; `lateCancellation` flag if within 24h.
- **Dev builds required** (not Expo Go) because of Mapbox native SDK.

## Environment

Both `app/.env` and `backend/.env` are required. Key vars:
- Frontend: `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_MAPBOX_TOKEN`
- Backend: `DATABASE_URL`, `DIRECT_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `PORT`
