create table if not exists public.team_benchmarks (
  team text primary key check (team in ('avida', 'santander')),
  team_name text not null,
  overholdelse_pct numeric(5,2) not null default 0,
  incoming_cases integer not null default 0,
  resolved_cases integer not null default 0,
  open_backlog integer not null default 0,
  avg_handle_minutes numeric(6,2) not null default 0,
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.team_benchmarks enable row level security;

drop policy if exists "Public read benchmark rows" on public.team_benchmarks;
create policy "Public read benchmark rows"
on public.team_benchmarks
for select
to anon, authenticated
using (true);

insert into public.team_benchmarks (
  team,
  team_name,
  overholdelse_pct,
  incoming_cases,
  resolved_cases,
  open_backlog,
  avg_handle_minutes
)
values
  ('avida', 'Team Avida', 96.2, 418, 407, 139, 7.8),
  ('santander', 'Team Santander', 94.7, 436, 401, 152, 8.1)
on conflict (team) do update
set
  team_name = excluded.team_name,
  overholdelse_pct = excluded.overholdelse_pct,
  incoming_cases = excluded.incoming_cases,
  resolved_cases = excluded.resolved_cases,
  open_backlog = excluded.open_backlog,
  avg_handle_minutes = excluded.avg_handle_minutes,
  updated_at = timezone('utc', now());
