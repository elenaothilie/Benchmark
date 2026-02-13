import { AutoRefresh } from "@/components/auto-refresh";
import { TvModeToggle } from "@/components/tv-mode-toggle";
import { getBenchmarks } from "@/lib/supabase-rest";
import { TEAM_THEME } from "@/lib/team-theme";
import type { TeamBenchmark } from "@/lib/types";
import type { CSSProperties } from "react";

export const dynamic = "force-dynamic";

function formatNumber(value: number, digits = 0) {
  return new Intl.NumberFormat("nb-NO", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

function formatTimestamp(rows: TeamBenchmark[]) {
  const mostRecent = rows
    .map((row) => row.updated_at)
    .filter(Boolean)
    .sort()
    .at(-1);

  if (!mostRecent) return "Demo values";
  return new Intl.DateTimeFormat("nb-NO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(mostRecent));
}

export default async function HomePage() {
  const rows = await getBenchmarks();
  const top = rows.reduce((prev, cur) =>
    cur.overholdelse_pct > prev.overholdelse_pct ? cur : prev,
  );
  const hasTie = rows.every(
    (row) => row.overholdelse_pct === rows[0].overholdelse_pct,
  );

  return (
    <main className="wallboard-shell">
      <AutoRefresh intervalMs={45000} />

      <header className="wallboard-header">
        <h1 className="wallboard-title">Benchmark Dashboard</h1>
        <div className="header-actions">
          <p className="wallboard-subtle">
            Last updated: {formatTimestamp(rows)} · Auto-refresh 45s
          </p>
          <TvModeToggle />
        </div>
      </header>

      <section className="teams-grid">
        {rows.map((team) => {
          const theme = TEAM_THEME[team.team];
          const leading = !hasTie && top.team === team.team;

          return (
            <article
              key={team.team}
              className={`team-panel ${leading ? "leading" : ""}`}
              style={
                {
                  "--team-primary": theme.primary,
                  "--team-accent": theme.accent,
                  "--team-deep": theme.deep,
                  "--team-mid": theme.mid,
                  "--team-font": theme.fontVar,
                } as CSSProperties
              }
            >
              <div className="team-head">
                <h2 className="team-name">{team.team_name}</h2>
                {leading ? <span className="lead-pill">Leading</span> : null}
              </div>

              <div className="main-kpi-wrap">
                <p className="main-kpi-label">Overholdelse %</p>
                <p className="main-kpi-value">
                  {formatNumber(team.overholdelse_pct, 1)}%
                </p>
              </div>

              <div className="secondary-grid">
                <div className="secondary-card">
                  <p className="secondary-label">Innkommende</p>
                  <p className="secondary-value">
                    {formatNumber(team.incoming_cases)}
                  </p>
                </div>
                <div className="secondary-card">
                  <p className="secondary-label">Løst i dag</p>
                  <p className="secondary-value">
                    {formatNumber(team.resolved_cases)}
                  </p>
                </div>
                <div className="secondary-card">
                  <p className="secondary-label">Åpen backlog</p>
                  <p className="secondary-value">
                    {formatNumber(team.open_backlog)}
                  </p>
                </div>
                <div className="secondary-card">
                  <p className="secondary-label">Behandlingstid</p>
                  <p className="secondary-value">
                    {formatNumber(team.avg_handle_minutes, 1)} min
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
