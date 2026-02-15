import { ThemeToggle } from "@/components/theme-toggle";
import { TvModeToggle } from "@/components/tv-mode-toggle";
import { AutoRefresh } from "@/components/auto-refresh";
import { getBenchmarks } from "@/lib/supabase-rest";
import { TEAM_THEME } from "@/lib/team-theme";
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

function formatSigned(value: number, digits = 1) {
  if (value === 0) {
    return `0.${"0".repeat(digits)}`;
  }

  const sign = value > 0 ? "+" : "-";
  return `${sign}${formatNumber(Math.abs(value), digits)}`;
}

function deltaClass(value: number, higherIsBetter = true) {
  if (value === 0) {
    return "neutral";
  }

  if (higherIsBetter) {
    return value > 0 ? "positive" : "negative";
  }

  return value < 0 ? "positive" : "negative";
}

function getMonthlyStatus(current: number, previous: number) {
  const delta = current - previous;
  if (delta > 0) return formatSigned(delta, 1);
  if (delta < 0) return formatSigned(delta, 1);
  return "0";
}

export default async function HomePage() {
  const rows = await getBenchmarks();
  const sortedRows = [...rows].sort((a, b) => {
    if (b.overholdelse_pct !== a.overholdelse_pct) {
      return b.overholdelse_pct - a.overholdelse_pct;
    }

    return b.resolved_cases - a.resolved_cases;
  });
  const top = sortedRows.reduce((prev, cur) =>
    cur.overholdelse_pct > prev.overholdelse_pct ? cur : prev,
  );
  const hasTie = rows.every(
    (row) => row.overholdelse_pct === rows[0].overholdelse_pct,
  );
  const challenger = sortedRows[1] ?? null;
  const leadMargin =
    challenger !== null ? top.overholdelse_pct - challenger.overholdelse_pct : 0;
  const latestUpdate = rows
    .map((row) => row.updated_at)
    .filter((value): value is string => Boolean(value))
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];
  const improvedTeams = rows.filter(
    (row) => row.overholdelse_pct > row.previous_month_pct,
  ).length;
  const teamsAtOrAboveBest = rows.filter(
    (row) => row.overholdelse_pct >= row.best_month_pct,
  ).length;
  const averageMonthlyDelta =
    rows.reduce(
      (sum, row) => sum + (row.overholdelse_pct - row.previous_month_pct),
      0,
    ) / rows.length;

  return (
    <main className="wallboard-shell">
      <AutoRefresh intervalMs={15000} />
      <header className="wallboard-header">
        <div>
          <h1 className="wallboard-title">Benchmark Dashboard</h1>
          <p className="wallboard-subtle">
            {latestUpdate
              ? `Updated ${new Intl.DateTimeFormat("nb-NO", {
                  dateStyle: "short",
                  timeStyle: "short",
                }).format(new Date(latestUpdate))}`
              : "Live competition snapshot"}
          </p>
        </div>
        <div className="header-actions">
          <ThemeToggle />
          <TvModeToggle />
        </div>
      </header>

      <section className="competition-strip">
        <div className="competition-head">
          <p className="competition-label">Competition</p>
          {challenger ? (
            hasTie ? (
              <p className="competition-value">Dead heat - all teams tied</p>
            ) : (
              <p className="competition-value">
                {top.team_name} leads by {formatNumber(leadMargin, 1)} pp
              </p>
            )
          ) : (
            <p className="competition-value">Waiting for challenger</p>
          )}
        </div>
        <div className="competition-bars">
          {sortedRows.map((team) => (
            <div key={team.team} className="competition-bar-row">
              <p className="competition-team">{team.team_name}</p>
              <div className="competition-track" aria-hidden>
                <div
                  className="competition-fill"
                  style={
                    {
                      width: `${toPercent(team.overholdelse_pct)}%`,
                      "--team-primary": TEAM_THEME[team.team].primary,
                    } as CSSProperties
                  }
                />
              </div>
              <p className="competition-score">
                {formatNumber(team.overholdelse_pct, 1)}%
              </p>
            </div>
          ))}
        </div>
      </section>

      {sortedRows.length >= 2 && (
        <section className="hero-kpi-strip" aria-label="Main KPI">
          <div
            className="hero-kpi-block"
            style={
              {
                "--team-primary": TEAM_THEME[sortedRows[0].team].primary,
                "--team-font": TEAM_THEME[sortedRows[0].team].fontVar,
              } as CSSProperties
            }
          >
            <p className="hero-kpi-label">{sortedRows[0].team_name}</p>
            <p className="hero-kpi-value">
              {formatNumber(sortedRows[0].overholdelse_pct, 1)}%
            </p>
          </div>
          <div className="hero-kpi-gap" aria-hidden />
          <div
            className="hero-kpi-block"
            style={
              {
                "--team-primary": TEAM_THEME[sortedRows[1].team].primary,
                "--team-font": TEAM_THEME[sortedRows[1].team].fontVar,
              } as CSSProperties
            }
          >
            <p className="hero-kpi-label">{sortedRows[1].team_name}</p>
            <p className="hero-kpi-value">
              {formatNumber(sortedRows[1].overholdelse_pct, 1)}%
            </p>
          </div>
        </section>
      )}

      <section className="overview-grid">
        <article className="overview-card">
          <p className="overview-label">Monthly momentum</p>
          <p className={`overview-value ${deltaClass(averageMonthlyDelta, true)}`}>
            {formatSigned(averageMonthlyDelta, 1)}
          </p>
        </article>
        <article className="overview-card">
          <p className="overview-label">Teams improving</p>
          <p className="overview-value">{improvedTeams}</p>
        </article>
        <article className="overview-card">
          <p className="overview-label">At best level</p>
          <p className="overview-value">{teamsAtOrAboveBest}</p>
        </article>
      </section>

      <section className="teams-grid">
        {sortedRows.map((team) => {
          const theme = TEAM_THEME[team.team];
          const rival = sortedRows.find((row) => row.team !== team.team) ?? null;
          const leading = !hasTie && top.team === team.team;
          const monthlyDelta = team.overholdelse_pct - team.previous_month_pct;
          const bestGap = team.overholdelse_pct - team.best_month_pct;
          const incomingDelta = rival ? team.incoming_cases - rival.incoming_cases : 0;
          const resolvedDelta = rival ? team.resolved_cases - rival.resolved_cases : 0;
          const backlogDelta = rival ? team.open_backlog - rival.open_backlog : 0;
          const handleDelta = rival
            ? team.avg_handle_minutes - rival.avg_handle_minutes
            : 0;

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
                <p className="main-kpi-label">NET PAYER RATIO</p>
                <p className="main-kpi-value">
                  {formatNumber(team.overholdelse_pct, 1)}%
                </p>
                <div className="kpi-track" aria-hidden>
                  <div
                    className="kpi-fill"
                    style={{ width: `${toPercent(team.overholdelse_pct)}%` }}
                  />
                </div>
                <p className={`self-month-status ${deltaClass(monthlyDelta, true)}`}>
                  {getMonthlyStatus(team.overholdelse_pct, team.previous_month_pct)}
                </p>
              </div>

              <div className="self-benchmark-grid">
                <div className="self-benchmark-card">
                  <p className="secondary-label">Previous month</p>
                  <p className="self-benchmark-value">
                    {formatNumber(team.previous_month_pct, 1)}%
                  </p>
                  <p className={`secondary-delta ${deltaClass(monthlyDelta, true)}`}>
                    {formatSigned(monthlyDelta, 1)}
                  </p>
                </div>
                <div className="self-benchmark-card">
                  <p className="secondary-label">Best month</p>
                  <p className="self-benchmark-value">
                    {formatNumber(team.best_month_pct, 1)}%
                  </p>
                  <p className={`secondary-delta ${deltaClass(bestGap, true)}`}>
                    {bestGap >= 0 ? "Best" : formatNumber(Math.abs(bestGap), 1)}
                  </p>
                  <div className="best-progress-track" aria-hidden>
                    <div
                      className="best-progress-fill"
                      style={{
                        width: `${toPercent(
                          team.best_month_pct > 0
                            ? (team.overholdelse_pct / team.best_month_pct) * 100
                            : 0,
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="secondary-grid">
                <div className="secondary-card incoming">
                  <p className="secondary-label">Handled calls</p>
                  <p className="secondary-value">
                    {formatNumber(team.incoming_cases)}
                  </p>
                  <p className={`secondary-delta ${deltaClass(incomingDelta, true)}`}>
                    {formatSigned(incomingDelta, 0)}
                  </p>
                </div>
                <div className="secondary-card resolved">
                  <p className="secondary-label">Kept</p>
                  <p className="secondary-value">
                    {formatNumber(team.resolved_cases)}
                  </p>
                  <p className={`secondary-delta ${deltaClass(resolvedDelta, true)}`}>
                    {formatSigned(resolvedDelta, 0)}
                  </p>
                </div>
                <div className="secondary-card backlog">
                  <p className="secondary-label">Negotiation</p>
                  <p className="secondary-value">
                    {formatNumber(team.open_backlog)}
                  </p>
                  <p className={`secondary-delta ${deltaClass(backlogDelta, false)}`}>
                    {formatSigned(backlogDelta, 0)}
                  </p>
                </div>
                <div className="secondary-card handle-time">
                  <p className="secondary-label">Wrap-up</p>
                  <p className="secondary-value">
                    {formatNumber(team.avg_handle_minutes, 1)} min
                  </p>
                  <p className={`secondary-delta ${deltaClass(handleDelta, false)}`}>
                    {formatSigned(handleDelta, 1)}
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
