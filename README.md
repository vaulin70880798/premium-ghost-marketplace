# Ghost Market MVP

Premium Apple-style MVP for an exclusive ghost-produced music marketplace.

Built with:
- Next.js App Router
- TypeScript
- Tailwind CSS
- Framer Motion
- Supabase-ready architecture

## What this MVP includes
- Premium landing page
- Browse tracks with search/filter/sort
- Track details with metadata, file bundle, rights messaging
- Favorites (client-persisted)
- Buyer dashboard
- Producer dashboard
- Upload track flow (mocked file handling UI)
- Custom services page + request form
- Checkout simulation + success/download state
- Auth pages + role selection
- Admin placeholder structure
- Empty/loading/404 states

## Demo roles
- Buyer
- Producer
- Admin

Role is selected in-app and persisted in local storage for demo behavior.

## Project structure
```text
src/
  app/
    api/
    admin/
    auth/
    checkout/[trackId]/
    dashboard/
    favorites/
    services/
    tracks/
    upload/
    layout.tsx
    page.tsx
    not-found.tsx
    loading.tsx
  components/
    checkout/
    dashboards/
    forms/
    layout/
    providers/
    shared/
    tracks/
    ui/
  data/
    seed.ts
    queries.ts
  lib/
    constants.ts
    utils.ts
    supabase/
  types/
    domain.ts
supabase/
  schema.sql
```

## Data + seed strategy
- Seed data is in `src/data/seed.ts`.
- Query/helpers are in `src/data/queries.ts`.
- UI consumes typed local data for fast MVP iteration.
- Replace helper internals with Supabase queries when moving from mocked to real backend.

## What is mocked vs real
Real in MVP:
- UI/UX flows and route architecture
- Track browsing/filtering/searching/sorting
- Favorites persistence (local storage)
- Role-based dashboard routing structure
- Form submission UX with toasts

Mocked in MVP:
- Payment processing (Stripe-ready placeholder)
- File uploads/download delivery (simulated)
- Auth persistence/session (demo mode)
- API handlers return mock success payloads

## Supabase setup
1. Create Supabase project.
2. Run `supabase/schema.sql` in SQL editor.
3. Fill `.env.local` from `.env.example`.
4. Replace local seed repositories with Supabase calls incrementally.

## Local development
```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Build + lint
```bash
npm run lint
npm run build
```

## Deploy to Vercel
1. Push repository to GitHub.
2. Import repo in Vercel.
3. Set env vars from `.env.example`.
4. Deploy.

## Suggested post-MVP upgrades
1. Supabase Auth with protected dashboards.
2. Real audio preview streaming + waveform.
3. Stripe checkout + webhook order finalization.
4. Supabase Storage for artwork/audio/packages.
5. Signed download URLs + legal rights-transfer PDF generation.
