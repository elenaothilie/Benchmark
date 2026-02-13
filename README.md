# Benchmark Wallboard

Wall-mounted KPI dashboard for Team Avida and Team Santander.

## Includes

- Public wallboard view at `/`
- Simple password-protected admin view at `/admin`
- Supabase-backed KPI storage
- Auto-refresh wallboard and subtle "Last updated" timestamp
- Team-specific fonts and color variables matching provided style board

## Environment Setup

Copy `.env.example` to `.env.local` and fill values:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
ADMIN_SESSION_SECRET=...
```

Admin login password is fixed to `admin123`.

## Database Setup

Run SQL migration in Supabase:

`supabase/migrations/20260213_create_team_benchmarks.sql`

It creates:

- `public.team_benchmarks`
- RLS + public read policy
- seed rows for both teams

## Run

```bash
npm install
npm run dev
```

Open:

- Wallboard: `http://localhost:3000/`
- Admin: `http://localhost:3000/admin`
