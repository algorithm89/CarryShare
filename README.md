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
- Vitest for unit tests

## Getting started

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## The main flow

```
Home → Search a flight → Browse listings on that flight → View a traveler
  → Request Match → Message Traveler → authorize/reconfirm CarryShare
  Protection → My Trips / Profile
```

Plus a standalone **Create Listing** flow (flight → need/share space → details
→ preview → publish), which immediately shows up under **My Trips**.

## Project structure

- `src/types` — domain model interfaces (`User`, `Flight`, `Listing`,
  `Match`, `Message`, `Trip`, `Protection`), shaped to map cleanly onto
  future Supabase/PostgreSQL tables.
- `src/data` — mocked in-memory data plus small CRUD-style helpers per
  entity (`users.ts`, `flights.ts`, `listings.ts`, `matches.ts`,
  `messages.ts`, `trips.ts`, `protection.ts`).
- `src/lib/services.ts` — the data-access seam every page/component goes
  through. Swapping the mock implementation for real Supabase calls later
  should not require touching any UI code.
- `src/lib/format.ts` — shared display formatting (dates, money, relative
  time, avatar initials/colors).
- `src/components` — reusable UI grouped by domain: `flight/`, `listing/`,
  `traveler/`, `match/`, `messages/`, `profile/`, `protection/`,
  `navigation/`, `home/`, `shared/`, and the generated `ui/` (shadcn)
  primitives.
- `src/app` — routes: `/`, `/search`, `/create-listing`, `/match/[id]`,
  `/messages`, `/profile`, `/trips`.

## CarryShare Protection

A commitment-and-accountability layer between two matched travelers, living
on the match detail page (`/match/[id]`) once a match exists. It is
explicitly **not insurance** — the UI makes that disclaimer visible, and no
real payments are processed (Stripe/Supabase come later).

How it works:

1. Both travelers **authorize** their agreed share of the extra baggage fee.
2. Both **reconfirm** their trip before a cutoff (default: 6 hours before
   departure).
3. **Cancelling before the cutoff** (or for an airline disruption, any time)
   carries no penalty, and the remaining traveler gets a "find a new match"
   link back to search.
4. **Cancelling late, or not showing up**, lets the other traveler file a
   claim (with an optional receipt upload placeholder) for their committed
   share.
5. Claims are reviewed (simulated in this prototype via "Simulate: approve /
   waive" buttons — in production this is a platform decision, not a user
   action) and resolve to either a charge (compensation to the other
   traveler) or a waiver.
6. Late cancellations and no-shows are tracked per user and shown on
   **Profile**.

Status badges from this system also surface compactly on **My Trips** and in
the **Messages** thread header.

**Known gap**: since the whole app only has one logged-in user, the *other*
side of a match can never authorize/reconfirm through the UI. Only the
pre-seeded demo match (Sarah ↔ you, on AC873) has both sides already
authorized/reconfirmed, so it's the one match where you can walk the full
lifecycle (no-show → claim → resolution, or mark-completed) end to end. New
matches you create will stay at "awaiting commitment."

## Known limitation of the mock data layer

Because there is no database yet, "mutations" (requesting a match, sending a
message, publishing a listing, authorizing a Protection commitment, etc.)
only update an in-memory array for the current browser session. A full page
reload (not client-side navigation) resets that state back to the seeded
demo data. This goes away once Supabase/PostgreSQL is wired in behind
`src/lib/services.ts`.

## Testing

Unit tests cover the CarryShare Protection state machine
(`src/data/protection.test.ts`): commitment splitting, the
authorize/reconfirm gating logic, on-time vs. late cancellation, claim
filing/approval/denial, and trust-counter tracking.

```bash
npm test        # run once in the terminal
npm run test:ui # launch the Vitest UI dashboard in a browser (prints a
                 # localhost URL with an access token on startup)
```

## Not implemented yet (by design)

Supabase/PostgreSQL, real authentication, real payments (Stripe), airline/
airport APIs, identity verification, and push notifications are
intentionally out of scope for this milestone.
