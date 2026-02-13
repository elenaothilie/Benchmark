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

function toPercent(value: number) {
  return Math.max(0, Math.min(100, value));
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
      <header className="wallboard-header">
        <h1 className="wallboard-title">Benchmark Dashboard</h1>
        <div className="header-actions">
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
                <p className="main-kpi-label">NET PAYRE RATIO</p>
                <p className="main-kpi-value">
                  {formatNumber(team.overholdelse_pct, 1)}%
                </p>
                <div className="kpi-track" aria-hidden>
                  <div
                    className="kpi-fill"
                    style={{ width: `${toPercent(team.overholdelse_pct)}%` }}
                  />
                </div>
              </div>

              <div className="secondary-grid">
                <div className="secondary-card incoming">
                  <p className="secondary-label">Handled calls</p>
                  <p className="secondary-value">
                    {formatNumber(team.incoming_cases)}
                  </p>
                </div>
                <div className="secondary-card resolved">
                  <p className="secondary-label">Kept percentage</p>
                  <p className="secondary-value">
                    {formatNumber(team.resolved_cases)}
                  </p>
                </div>
                <div className="secondary-card backlog">
                  <p className="secondary-label">Negotiation rate</p>
                  <p className="secondary-value">
                    {formatNumber(team.open_backlog)}
                  </p>
                </div>
                <div className="secondary-card handle-time">
                  <p className="secondary-label">Wrap-up</p>
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
