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
- **Routing:** Expo Router (file-based). Tab nav in `app/(tabs)/`, dynamic routes for `workshop/[id]`, `booking/[workshopId]`, `snapshot/[projectId]`. Snapshot timeline is embedded inline on both the workshop detail and booking flow pages (not only a standalone route).
- **State:** Zustand (`lib/store.ts`) for auth + cached lookups; React Query hooks (`hooks/`) for server state.
- **API layer:** Custom fetch wrapper in `lib/api.ts`, base URL from `EXPO_PUBLIC_API_URL`.
- **Types:** All in `types/index.ts`, matching Prisma snake_case DB output.
- **Init flow:** Root `_layout.tsx` calls `initialize()` then `fetchLookups()` sequentially. `initialize()` reads user ID from `expo-secure-store` and fetches profile via `/api/auth/me/:userId`.
- **Path alias:** `@/` maps to the `app/` project root (e.g., `@/types`, `@/lib/store`).
- **Tabs:** Home (index), Map, Bookings (role-aware: booker view + host "Incoming" view), Profile.
- **React Query config:** 5-min stale time, 2 retries. Wrapped at root layout level. Query keys use tuples: `['workshops', params]`, `['bookings', 'user', userId, status]`, `['bookings', 'host', hostId, status]`, `['projects', 'workshop', workshopId]`. Mutations invalidate related queries.
- **No linter or test runner configured.** No ESLint, no Jest/Vitest.

### Backend (`backend/`)
- **Entry:** `src/app.ts` — Express with CORS, routes mounted at `/api/*`. Static files served at `/uploads`.
- **Routes:** `src/routes/` organized by domain: `lookups`, `workshops`, `bookings`, `snapshots`. Auth routes in `src/routes/auth.ts`.
- **DB:** Prisma for schema management and seeding only. **Runtime queries use Supabase JS client** (`src/lib/supabase.ts`), not Prisma Client. Schema in `prisma/schema.prisma` (16 models). Seed in `prisma/seed.ts`.
- **Auth:** No auth middleware. User identity comes from request body (e.g., `bookerId`), not tokens. No logout or registration endpoints — MVP uses pre-seeded users. Client stores user ID in `expo-secure-store`.
- **Supabase query style:** Runtime queries use Supabase JS select syntax with FK joins (e.g., `host:users!workshops_host_id_fkey(*)`). All queries and responses are snake_case.
- **Photos:** API expects pre-signed Supabase Storage URLs as strings — no multipart upload. Frontend uploads to Supabase Storage first, then sends URLs to API.
- **No input validation library** (no Zod, Joi). Required fields checked manually. No shared types between frontend and backend.

### Supabase FK join syntax
Runtime queries use PostgREST-style FK joins. When writing new queries, follow this pattern:
```typescript
// Alias : table ! foreign_key_constraint_name ( columns )
const { data } = await supabase
  .from('bookings')
  .select(`*, workshop:workshops!bookings_workshop_id_fkey(name, photo_urls),
              booker:users!bookings_booker_id_fkey(full_name, avatar_url),
              timeSlotType:time_slot_types!bookings_time_slot_type_id_fkey(*)`)
```
Constraint names follow Prisma's convention: `{table}_{column}_fkey`. Check `prisma/schema.prisma` for relationship names.

### Key API endpoints
- `GET /api/health` — health check
- `GET /api/lookups/all` — all lookups in one call (cached on app init)
- `GET /api/auth/me/:userId` — fetch user profile (session persistence)
- `POST /api/auth/login` — email/password login (no registration endpoint — users pre-seeded for MVP)
- `GET /api/workshops?lat=&lng=&radius=&equipment=&category=` — geo + filter search
- `POST /api/bookings` — validates safety rules, slot availability, calculates price
- `GET /api/bookings/workshop/:workshopId` — host's incoming bookings
- `POST /api/snapshots/projects` — create a project for a booking
- `GET /api/snapshots/projects/:projectId` — full timeline with snapshots
- `GET /api/snapshots/user/:userId` — all projects for a booker
- `POST /api/snapshots/projects/:projectId/snapshots` — requires before + after photos
- `GET /api/snapshots/workshop/:workshopId` — all projects + snapshots for a workshop (used for build log display)
- `GET /api/bookings/host/:hostId?status=` — all bookings across host's workshops with booker info

## Enums & state machines

- **UserRole:** `HOST`, `BOOKER`, `BOTH`
- **BookingStatus:** `PENDING` → `CONFIRMED` → `COMPLETED` (or `CANCELLED` from any state). Transition to `COMPLETED` requires at least one snapshot.

## Photo upload flow

Frontend uploads to Supabase Storage directly (via `expo-image-picker` → Supabase SDK), receives a public URL, then passes that URL string to the API. The backend never handles file bytes.

## Domain rules

- **Lookups are DB-driven, never hardcoded.** Frontend fetches from API, caches in Zustand.
- **Safety rules:** 3 platform-wide rules enforced at booking time (`constants/safety-rules.ts`).
- **Snapshot enforcement:** Both before and after photos required. Host cannot mark booking COMPLETED without snapshots.
- **Snapshot display chain:** `workshops` → `bookings` (via `workshop_id`) → `projects` (via `booking_id`) → `snapshots` (via `project_id`) + `snapshot_tools` + `snapshot_skills`. The workshop detail page and booking flow page both show "Build Logs" — past projects with snapshot timelines, before/after photos, relative timestamps, and skills gained.
- **Booking visibility:** Booker's bookings show host name; host's incoming bookings show client (booker) name. Bookings tab toggles between "My Bookings" and "Incoming" for users with role `BOTH`.
- **Pricing:** `totalPrice = hourlyRate + sum(addon prices)`. `priceAtBooking` frozen at purchase time.
- **Geo search:** Bounding-box approximation, not PostGIS. All mock data uses Wichita, KS coordinates.
- **Cancellation:** Free if >24h away; `lateCancellation` flag if within 24h.
- **Slot availability:** Creating a booking sets `workshop_availability.is_available = false`; cancelling re-opens it. No DB-level double-booking prevention.
- **Lookups response shape:** `{ serviceCategories, equipmentCategories, timeSlots, addons }`. `equipmentCategories` includes nested `equipment` arrays.
- **Dev builds required** (not Expo Go) because of Mapbox native SDK.

## Key versions

- Expo SDK 55 (canary), React 19, React Native 0.83, React Query 5, Zustand 5
- Backend: Express 4, Prisma 6, Supabase JS 2, TypeScript 5.7

## Environment

Both `app/.env` and `backend/.env` are required. Key vars:
- Frontend: `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_MAPBOX_TOKEN`
- Backend: `DATABASE_URL`, `DIRECT_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `PORT`
