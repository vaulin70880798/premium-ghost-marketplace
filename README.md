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
- Real browser audio playback for preview tracks
- Favorites (client-persisted)
- Buyer dashboard
- Producer dashboard
- Upload track flow (admin-only for this phase)
- Custom services page + request form
- Checkout simulation + success/download state
- Auth pages with Email/Password + Google OAuth
- Strict role-based route access (buyer/producer/admin)
- Admin onboarding form for producer account creation
- Admin track management panel (add/delete/publish/sold state + preview/package download links)
- Empty/loading/404 states

## Roles
- Buyer
- Producer
- Admin

Behavior:
- All public signups are created as `buyer`.
- Only `admin` can create `producer` accounts.
- Admin area is visible only to admin users.

Temporary bootstrap admin login (hardcoded for current phase):
- Email: `admin@ghostmarket.local`
- Password: `Admin#2026!`
- Defined in `src/lib/auth/demo-admin.ts`

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
- Preview audio files are in `public/previews` and license metadata is in `public/previews/LICENSES.md`.

## What is mocked vs real
Real in MVP:
- UI/UX flows and route architecture
- Track browsing/filtering/searching/sorting
- Real preview audio playback from legal CC0 demo tracks
- Favorites persistence (local storage)
- Supabase Auth sign-in/sign-up flows (when env is configured)
- Google OAuth sign-in flow (when configured in Supabase)
- Server-side role guards for buyer/producer/admin routes
- Form submission UX with toasts
- Admin-only upload route (`/upload`)
- Admin track CRUD API (`/api/admin/tracks`)

Mocked in MVP:
- Payment processing (PayPal/Stripe not connected yet)
- File uploads/download delivery (simulated)
- Favorites backend sync (still local storage)
- Checkout is visual simulation only (no real charge/capture)

## Supabase setup
1. Create Supabase project.
2. Enable Email auth in Supabase Authentication.
3. Enable Google provider in Supabase Authentication:
   - Add Google OAuth client ID/secret in Supabase.
   - Add redirect URL: `<your-site>/auth/callback`.
4. Run `supabase/schema.sql` in SQL editor.
5. Fill `.env.local` from `.env.example`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server only)
6. Create one admin user:
   - Sign up normally first, then update `profiles.role = 'admin'` manually in Supabase SQL once.
7. (Optional) seed tracks into `tracks` table; app falls back to local seed if DB is empty/unconfigured.

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
1. PayPal checkout (create/capture/webhooks + idempotency).
2. Supabase Storage for artwork/audio/packages.
3. Favorites/orders/service-requests full DB-backed repositories.
4. Signed download URLs + legal rights-transfer PDF generation.
5. Producer public profile pages backed by real DB content.
