# CarryShare

**Share the Journey. Share the Bag.**

CarryShare is a peer-to-peer travel marketplace that helps passengers on the
same commercial flight find each other and coordinate sharing the cost of
extra checked luggage. CarryShare is a **matching platform** — it does not
collect, store, or transport luggage, and does not operate warehouses or
airport counters. Travelers arrange the details themselves.

This repository is the **frontend-only MVP**: a fully clickable prototype
built on realistic mocked data, with no backend, database, or real
authentication yet.

## Tech stack

- Next.js (App Router) + React + TypeScript
- Tailwind CSS v4 + shadcn/ui (Base UI primitives)
- Lucide React icons
- Local React state for interactivity — no global state library

## Getting started

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Project structure

- `src/types` — domain model interfaces (`User`, `Flight`, `Listing`,
  `Match`, `Message`, `Trip`), shaped to map cleanly onto future
  Supabase/PostgreSQL tables.
- `src/data` — mocked in-memory data plus small CRUD-style helpers per
  entity.
- `src/lib/services.ts` — the data-access seam every page/component goes
  through. Swapping the mock implementation for real Supabase calls later
  should not require touching any UI code.
- `src/components` — reusable UI (flight search/cards, listing & traveler
  cards, messaging UI, navigation, etc.), grouped by domain.
- `src/app` — routes: `/`, `/search`, `/create-listing`, `/match/[id]`,
  `/messages`, `/profile`, `/trips`.

## Known limitation of the mock data layer

Because there is no database yet, "mutations" (requesting a match, sending a
message, publishing a listing) only update an in-memory array for the
current browser session. A full page reload (not client-side navigation)
resets that state back to the seeded demo data. This goes away once
Supabase/PostgreSQL is wired in behind `src/lib/services.ts`.

## Not implemented yet (by design)

Supabase/PostgreSQL, real authentication, payments, airline/airport APIs,
identity verification, and push notifications are intentionally out of
scope for this milestone.
