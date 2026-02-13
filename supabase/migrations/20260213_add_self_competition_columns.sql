alter table public.team_benchmarks
add column if not exists previous_month_pct numeric(5,2) not null default 0,
add column if not exists best_month_pct numeric(5,2) not null default 0;

update public.team_benchmarks
set
  previous_month_pct = case
    when team = 'avida' then 95.1
    when team = 'santander' then 95.3
    else overholdelse_pct
  end,
  best_month_pct = case
    when team = 'avida' then 97.4
    when team = 'santander' then 96.8
    else overholdelse_pct
  end
where previous_month_pct = 0
   or best_month_pct = 0;
