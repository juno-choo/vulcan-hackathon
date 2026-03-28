# Vulcan — "Airbnb for Skilled Hands"

## Design Document & Implementation Spec

> **Audience**: Claude Code (AI coding agent)
> **Context**: MVP
> **Last updated**: 2026-03-27

---

## 1. Product overview

Vulcan is a mobile marketplace that connects people who want to learn hands-on skills (Bookers) with workshop owners who have professional tools and expertise (Hosts). Think Airbnb, but instead of renting a bedroom, you're booking time in someone's woodworking shop, welding studio, or 3D printing lab — with optional mentorship.

### Core value proposition

- **For Bookers**: Access expensive tools and expert guidance without buying equipment or renting a full shop.
- **For Hosts**: Monetize idle workshop time and share their craft.

### One-liner

> Book a workbench, learn a skill, document your build.

---

## 2. Tech stack

| Layer | Technology |
|-------|-----------|
| Mobile app | React Native (Expo) TypeScript |
| Backend | Node.js + Express |
| ORM | Prisma |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Map | Mapbox API |
| File storage | Supabase Storage (photos) |
| Animations | Framer Motion |
| UI inspiration | ~/ui inspo |

### Deployment

- Use Expo to let users experience the prototype on Android (direct install).
- Apple requires TestFlight / dev provisioning — out of scope for hackathon.

---


### What ships

All three features ship together:

1. **Workshop Radar** — Map-based search with equipment filtering.
2. **Booking System** — Date/time slot picker, add-ons, dynamic pricing, safety modal.
3. **Build-Log Snapshots** — Tree-like vertical timeline with before/after photos per session.

### What does NOT ship

- In-app messaging (TBD post-hackathon)
- Payment processing (mock the checkout; no Stripe integration)
- Push notifications
- Admin dashboard
- Revenue model / platform fees (not decided yet)
- Host analytics or earnings dashboard

### Key MVP constraints

- **One workshop per host** (no multi-workshop management).
- **Single time slot per booking** (no multi-slot reservations).
- **Platform-wide safety rules** (not per-workshop custom rules).
- **Revenue model undecided** — no commission or subscription logic. The schema should be structured so this can be added later without migration pain.
- **Messaging undecided** — do not build chat. If host contact is needed, display the host's email/phone from their profile.

---

## 4. User roles

There are two roles: **Booker** and **Host**. A user can be both (enum: `HOST | BOOKER | BOTH`). Auth is handled by Supabase Auth; the `users` table links via `auth_id`.

### Booker flow (pages)

```
Homepage inspired from ~/ui inspo/home.png
Peek sub page inspired from ~/ui inspo/peek.png
Search (map) → Browse workshop detail → Select date + time slot
→ Toggle add-ons → Review receipt → Acknowledge safety rules
→ Confirm booking → Attend session → View snapshot timeline → Leave review
```

### Host flow

```
Create workshop profile → Add equipment list → Set hourly rate + add-on prices
→ Set availability (date + time slot grid) → Accept/decline booking requests
→ Run session → Commit snapshot (before + after photos required)
→ Mark booking complete
```

---

## 5. Screen inventory

### Booker screens

| Screen | Description |
|--------|-------------|
| **Home / Map search** | Full-screen Mapbox map with workshop pins. Capability filter pills above the map. Tapping a pin shows a popup card (name, rating, equipment highlights). |
| **Workshop detail** | Hero photos, host avatar + bio, equipment list (tags), hourly rate, reviews. CTA: "Book a session". |
| **Booking flow** | Horizontal date picker → time slot grid (Morning / Afternoon / Evening) → "Your Build Setup" sidebar with toggleable add-ons → dynamic receipt → "Safety First" modal with 3 checkboxes → "Book Now" button. |
| **My bookings** | List of upcoming/past bookings with status badges (Pending, Confirmed, Completed, Cancelled). |
| **Project timeline** | Vertical git-commit-style timeline. Each node expands into a card showing before/after photos, tools used (tags), skills gained (tags). Latest entry has a "Snapshot Slider" to scrub between before and after. |
| **Profile / Settings** | Edit name, avatar, bio, phone, location. |

### Host screens

| Screen | Description |
|--------|-------------|
| **Dashboard** | Upcoming bookings, quick stats (rating, total sessions). |
| **Workshop management** | Edit workshop name, description, address, photos, hourly rate. Toggle equipment from the catalog. Set custom add-on prices. |
| **Availability calendar** | Grid of dates × time slots. Tap to toggle available/unavailable. |
| **Incoming bookings** | List of pending bookings to accept or decline. Shows booker info + selected add-ons. |
| **Snapshot capture** | Camera UI to take before photo → after photo. Tag tools used + skills gained from catalog dropdowns. Submit snapshot. **Both before and after photos are required.** |
| **Profile / Settings** | Same as booker. |

---

## 6. Database schema

### ER overview

```
Users ──< Workshops ──< WorkshopEquipment >── EquipmentCatalog ──< EquipmentCategories
  │            │
  │            ├──< WorkshopAvailability >── TimeSlotTypes
  │            │
  │            └──< Bookings ──< BookingAddons >── AddonCatalog
  │                    │
  │                    ├── Projects ──< Snapshots ──< SnapshotTools >── EquipmentCatalog
  │                    │                    └──< SnapshotSkills >── SkillCatalog
  │                    │
  └── Reviews ─────────┘

ServiceCategories ──< Workshops
                  ──< SkillCatalog
```

### Prisma schema

The complete Prisma schema lives at `prisma/schema.prisma`. Key design decisions:

- **`@map()` on every field** — Prisma uses camelCase in JS, snake_case in Postgres (Supabase convention).
- **UUID primary keys** — `@default(uuid()) @db.Uuid` on all `id` fields.
- **Decimal for money** — `@db.Decimal(10, 2)` on all price fields. Never use Float for money.
- **Composite unique constraints** on junction tables to prevent duplicates (e.g., `@@unique([workshopId, equipmentId])`).
- **Cascade deletes** — Deleting a workshop cascades to its equipment, availability, and bookings. Deleting a booking cascades to its addons and project/snapshots.
- **`updatedAt` with `@updatedAt`** — Prisma auto-manages this on every write.

### Enums

```prisma
enum UserRole {
  HOST
  BOOKER
  BOTH
}

enum BookingStatus {
  PENDING
  CONFIRMED
  COMPLETED
  CANCELLED
}
```

### Models (16 total)

#### Core

| Model | Purpose | Key fields |
|-------|---------|------------|
| `User` | All users, linked to Supabase Auth | `authId`, `email`, `fullName`, `role`, `bio`, `location` (JSON: city, state, lat, lng) |
| `Workshop` | A host's workspace listing | `hostId` (FK → User), `serviceCategoryId` (FK), `latitude`, `longitude`, `hourlyRate`, `photoUrls` (string array), `avgRating`, `isActive` |

#### Lookup / reference tables (seeded, not hardcoded in frontend)

| Model | Purpose | Seed count |
|-------|---------|------------|
| `ServiceCategory` | Top-level workshop types | 6 (Woodworking, Metalworking, 3D Printing & CNC, Electronics, Automotive, Ceramics & Pottery) |
| `EquipmentCategory` | Equipment groupings for filter UI | 7 (Power Tools, Hand Tools, CNC & Digital Fabrication, Welding Equipment, Safety Equipment, Finishing Tools, Measurement & Layout) |
| `EquipmentCatalog` | Individual equipment items | 39 items across all categories |
| `SkillCatalog` | Learnable skills, tied to service categories | 33 skills across all categories |
| `TimeSlotType` | Available booking periods | 3 (Morning 08:00–12:00, Afternoon 12:00–17:00, Evening 17:00–21:00) |
| `AddonCatalog` | Bookable extras | (Expert Mentorship, Consumable Materials) |

**Critical**: The frontend must fetch these from the API (`GET /api/lookups/all`), never hardcode them. This allows adding new categories, equipment, or skills without a code deploy.

#### Junction tables

| Model | Connects | Unique constraint |
|-------|----------|-------------------|
| `WorkshopEquipment` | Workshop ↔ EquipmentCatalog | `[workshopId, equipmentId]` |
| `WorkshopAvailability` | Workshop ↔ TimeSlotType + date | `[workshopId, timeSlotTypeId, availableDate]` |
| `BookingAddon` | Booking ↔ AddonCatalog | `[bookingId, addonId]` — stores `priceAtBooking` to freeze the price at time of purchase |
| `SnapshotTool` | Snapshot ↔ EquipmentCatalog | `[snapshotId, equipmentId]` |
| `SnapshotSkill` | Snapshot ↔ SkillCatalog | `[snapshotId, skillId]` |

#### Booking system

| Model | Purpose | Key fields |
|-------|---------|------------|
| `Booking` | A reserved session | `bookerId`, `workshopId`, `timeSlotTypeId`, `bookingDate`, `status`, `basePrice`, `totalPrice`, `safetyAcknowledged` |
| `Review` | Post-session feedback | `bookingId` (unique — one review per booking), `reviewerId`, `rating` (1–5), `comment` |

#### Snapshot system

| Model | Purpose | Key fields |
|-------|---------|------------|
| `Project` | Container for a booking's build log | `bookingId` (unique — one project per booking), `title`, `description` |
| `Snapshot` | A single "commit" in the timeline | `projectId`, `sequenceNumber`, `beforePhotoUrl`, `afterPhotoUrl`, `notes` |

**Snapshot enforcement rule**: A host cannot mark a booking as `COMPLETED` unless at least one snapshot exists with both `beforePhotoUrl` and `afterPhotoUrl` populated. Enforce this in the `PATCH /api/bookings/:id/status` endpoint.

---

## 7. API endpoints

Base URL: `/api`

### Lookups (read-only, public)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/lookups/all` | Returns all lookup tables in one response: `{ serviceCategories, equipmentCategories, timeSlots, addons }`. Call on app init, cache in React state/context. |
| `GET` | `/lookups/service-categories` | Individual lookup fetch |
| `GET` | `/lookups/equipment-categories` | Includes nested `equipment` items |
| `GET` | `/lookups/equipment?categoryId=` | Flat list, filterable by category |
| `GET` | `/lookups/skills?serviceCategoryId=` | Filterable by service category |
| `GET` | `/lookups/time-slots` | Morning / Afternoon / Evening |
| `GET` | `/lookups/addons` | Active add-ons only |

### Workshops

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/workshops?lat=&lng=&radius=&equipment=&category=` | Map search. `equipment` is comma-separated IDs. Returns paginated results with host info, equipment list, service category. |
| `GET` | `/workshops/:id` | Full detail with host bio, equipment, upcoming availability, recent reviews (last 10). |
| `POST` | `/workshops` | Create workshop (host only). Body: `{ hostId, serviceCategoryId, name, description, address, latitude, longitude, hourlyRate, photoUrls }` |
| `PUT` | `/workshops/:id/equipment` | Replace equipment list. Body: `{ equipmentIds: string[] }` |
| `POST` | `/workshops/:id/availability` | Upsert availability slots. Body: `{ slots: [{ timeSlotTypeId, availableDate, isAvailable }] }` |

### Bookings

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/bookings` | Create booking. Validates: safety acknowledged, slot available, no conflict. Calculates `totalPrice = hourlyRate + sum(addon prices)`. Marks slot as unavailable. Body: `{ bookerId, workshopId, timeSlotTypeId, bookingDate, addonIds[], safetyAcknowledged, notes }` |
| `GET` | `/bookings/user/:userId?status=` | Booker's bookings, filterable by status. |
| `GET` | `/bookings/workshop/:workshopId` | Host's incoming bookings with booker details. |
| `PATCH` | `/bookings/:id/status` | Update status. Body: `{ status: "CONFIRMED" | "COMPLETED" | "CANCELLED" }`. If `COMPLETED`: enforce snapshot rule. If `CANCELLED`: re-open the availability slot. |

### Cancellation logic

- If `bookingDate` is more than 24 hours away: free cancellation, status → `CANCELLED`, slot re-opened.
- If `bookingDate` is within 24 hours: the endpoint should still allow cancellation but flag `lateCancellation: true` in the response. (No penalty mechanism for MVP, but the flag is there for post-hackathon.)

### Snapshots / Projects

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/snapshots/projects` | Create project for a booking. Body: `{ bookingId, title, description }` |
| `GET` | `/snapshots/projects/:projectId` | Full timeline: project + all snapshots (ordered by `sequenceNumber` asc) with tools and skills expanded. |
| `POST` | `/snapshots/projects/:projectId/snapshots` | Commit a snapshot. Auto-increments `sequenceNumber`. Body: `{ beforePhotoUrl, afterPhotoUrl, notes, toolIds[], skillIds[] }`. **Both photo URLs are required.** |
| `GET` | `/snapshots/user/:userId` | All projects for a booker, with latest snapshot preview and total snapshot count. |

---

## 8. Pricing model

### How pricing works in MVP

- **Host sets their own `hourlyRate`** on their workshop profile.
- **Host sets add-on prices** — the `AddonCatalog` seed provides default prices, but hosts can override them. (Implementation note: for MVP, the simplest approach is to use the catalog prices as defaults. Post-hackathon, add a `workshop_addon_prices` override table.)
- **`basePrice`** = workshop's `hourlyRate` (one time slot = one rate).
- **`totalPrice`** = `basePrice` + sum of selected add-on prices.
- **`priceAtBooking`** is stored on `BookingAddon` to freeze the price at time of purchase, even if the host changes prices later.
- **Revenue model is undecided** — no platform commission or fees are charged. The schema supports adding a `platformFee` field to `Booking` later.

---

## 9. Safety system

The booking flow requires the booker to acknowledge **3 platform-wide safety rules** before the "Book Now" button is enabled. These are not customizable per workshop in MVP.

### Safety rules (hardcoded in frontend for MVP)

1. "I will wear appropriate personal protective equipment (PPE) at all times in the workshop."
2. "I will not operate any tool or machine without the host's explicit permission and instruction."
3. "I understand that I am responsible for following all posted safety guidelines and the host's safety instructions."

All three must be checked. The `safetyAcknowledged` boolean on the `Booking` model is set to `true` only when all three are checked. The backend rejects bookings where `safetyAcknowledged` is `false`.

---

## 10. Snapshot enforcement

The snapshot system is the platform's differentiator — it creates a portfolio of the booker's skill progression and proves the host delivered value.

### Rules

- A `Project` is created when a booking is confirmed (or when the host initiates the first snapshot).
- Each snapshot requires **both** `beforePhotoUrl` and `afterPhotoUrl`. The API should reject snapshots where either is missing.
- Snapshots are ordered by `sequenceNumber` (auto-incremented, starting at 1).
- A host **cannot** mark a booking as `COMPLETED` unless the project has at least one snapshot with both photos.
- The booker sees the timeline as read-only. Only the host can commit snapshots.
- The latest snapshot entry in the booker's timeline view should include a "Snapshot Slider" — a UI component that lets the user scrub between the before and after states.

---

## 11. Map search behavior

### Workshop Radar — how it works

1. The map loads centered on the booker's current location (or a default city).
2. Workshops appear as interactive pins. The Mapbox API renders the map; pins are React Native components overlaid on it.
3. **Hovering/tapping a pin** shows a popup card: workshop name, star rating, top 3 equipment highlights (icon + name).
4. **Capability filter bar** sits above the map — a horizontal scrollable row of pill-shaped buttons with tool icons (sourced from `EquipmentCatalog`). Tapping a pill filters the visible pins.
5. Filtering is done via the API: `GET /api/workshops?lat=...&lng=...&equipment=id1,id2`. The frontend sends the selected equipment IDs and re-renders the pins from the response.
6. For the hackathon prototype: if the Mapbox integration is blocked, fall back to a JSON mock dataset of 10–15 workshops and filter locally in React state.

### Geo search implementation

The API uses a bounding-box approximation (not PostGIS):

```
latDelta = radiusKm / 111
lngDelta = radiusKm / (111 * cos(lat * π / 180))
```

This is good enough for MVP. Post-hackathon, switch to Supabase's PostGIS extension for proper `ST_DWithin` queries.

---

## 12. Frontend data flow

### App initialization

On app launch, make one call to `GET /api/lookups/all`. Store the response in React Context or Zustand. All filter pills, equipment tags, add-on lists, skill dropdowns, and time slot grids render from this cached data.

```
App boot → fetch /api/lookups/all → store in global state
         → fetch user profile → determine role → route to Booker or Host home
```

### State management recommendation

- **Zustand** or React Context for global state (lookups, auth user, current role).
- **React Query / TanStack Query** for server state (workshops, bookings, snapshots) — handles caching, refetching, and optimistic updates.
- **Local React state** for UI-only state (filter selections, form inputs, modal visibility).

---

## 13. File structure
**Separate backend and frontend folders. As 2 devs will work on each folder**

```
skillshare/
├── app/                          # Expo Router (file-based routing)
│   ├── (tabs)/                   # Tab navigator
│   │   ├── index.tsx             # Map search (Booker) or Dashboard (Host)
│   │   ├── bookings.tsx          # My bookings list
│   │   ├── projects.tsx          # My project timelines
│   │   └── profile.tsx           # Profile & settings
│   ├── workshop/
│   │   ├── [id].tsx              # Workshop detail
│   │   └── manage.tsx            # Host: edit workshop
│   ├── booking/
│   │   ├── [workshopId].tsx      # Booking flow
│   │   └── [id]/status.tsx       # Booking detail + status
│   ├── snapshot/
│   │   ├── [projectId].tsx       # Timeline view
│   │   └── capture.tsx           # Host: take snapshot
│   └── _layout.tsx               # Root layout
├── components/
│   ├── map/
│   │   ├── WorkshopMap.tsx       # Mapbox wrapper
│   │   ├── WorkshopPin.tsx       # Pin component
│   │   └── CapabilityFilter.tsx  # Filter pills bar
│   ├── booking/
│   │   ├── DatePicker.tsx        # Horizontal date picker
│   │   ├── TimeSlotGrid.tsx      # Morning/Afternoon/Evening grid
│   │   ├── AddonToggle.tsx       # Individual add-on toggle
│   │   ├── BuildSetup.tsx        # "Your Build Setup" sidebar
│   │   ├── DynamicReceipt.tsx    # Real-time pricing receipt
│   │   └── SafetyModal.tsx       # 3-checkbox safety modal
│   ├── snapshot/
│   │   ├── Timeline.tsx          # Vertical git-commit tree
│   │   ├── SnapshotCard.tsx      # Expandable node card
│   │   └── SnapshotSlider.tsx    # Before/after scrubber
│   └── ui/
│       ├── Badge.tsx
│       ├── Card.tsx
│       └── Rating.tsx
├── lib/
│   ├── api.ts                    # Axios/fetch wrapper, base URL config
│   ├── auth.ts                   # Supabase Auth helpers
│   └── store.ts                  # Zustand store (lookups, user)
├── hooks/
│   ├── useLookups.ts             # Hook to access cached lookups
│   ├── useWorkshops.ts           # React Query hook for workshop search
│   ├── useBookings.ts            # React Query hook for bookings
│   └── useSnapshots.ts           # React Query hook for project timelines
├── types/
│   └── index.ts                  # TypeScript types matching Prisma models
├── constants/
│   └── safety-rules.ts           # The 3 platform-wide safety rules
├── backend/                      # Express API (separate from Expo)
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── src/
│   │   ├── app.js
│   │   ├── lib/prisma.js
│   │   └── routes/
│   │       ├── lookups.js
│   │       ├── workshops.js
│   │       ├── bookings.js
│   │       └── snapshots.js
│   ├── package.json
│   └── .env
├── app.json                      # Expo config
└── package.json
```

---

## 14. Implementation order

Build in this order:

### Phase 1: Foundation 

1. Initialize Expo project with file-based routing.
2. Set up the Express backend with Prisma.
3. Connect to Supabase, run `prisma db push`, run seed.
4. Build the `GET /api/lookups/all` endpoint and verify it returns data.
5. Set up Supabase Auth (email/password for MVP).
6. Build the Zustand store and `useLookups` hook.

### Phase 2: Map search

1. Integrate Mapbox in the map page.
2. Build `WorkshopPin` and popup card components.
3. Build `CapabilityFilter` pill bar.
4. Wire up `GET /api/workshops` with geo + equipment filters.
5. Build the workshop detail screen.
6. Seed 10–15 mock workshops with realistic Chicago-area coordinates for demo.

### Phase 3: Booking system (hours 8–14)

1. Build `DatePicker`, `TimeSlotGrid`, `BuildSetup`, `DynamicReceipt`, `SafetyModal`.
2. Wire up `POST /api/bookings` with validation.
3. Build the host's availability calendar and `POST /api/workshops/:id/availability`.
4. Build the booker's "My Bookings" list.
5. Build booking status management (`PATCH /api/bookings/:id/status`).
6. Implement 24-hour cancellation window logic.

### Phase 4: Snapshot timeline

1. Build the vertical `Timeline` component with Framer Motion node expansion animations.
2. Build `SnapshotCard` with before/after photos, tool tags, skill tags.
3. Build `SnapshotSlider` (image scrubber between before and after).
4. Build the host's snapshot capture screen.
5. Wire up project creation and snapshot commit endpoints.
6. Enforce: both photos required, at least 1 snapshot to complete booking.

### Phase 5: Polish

1. Styling pass — match the Dribbble reference aesthetic.
2. Error states, loading skeletons, empty states.
3. Test the full flow: search → book → host accepts → host snapshots → complete → review.
4. Build Expo APK for Android demo.

---

## 15. Mock data for demo

Seed the following for the hackathon demo:

- **5 host users** with Wichita, Kansas -area locations.
- **3 workshops**: two Woodworking, two Metalworking, one 3D Printing, one pottery
- **Each workshop** has 5–8 equipment items, availability for the next 7 days, and a realistic hourly rate ($35–$75).
- **2 booker users**.
- **2 completed bookings** with projects and 3 snapshots each (use placeholder images from Unsplash or Pexels).
- **1 pending booking** to demonstrate the booking flow.

Add this mock data to `prisma/seed.js` after the lookup data.

---

## 16. Version Control
Start with 'main' branch. My teammmate and I will branch off from there.

