import { ThemeToggle } from "@/components/theme-toggle";
import { TvModeToggle } from "@/components/tv-mode-toggle";
import { AutoRefresh } from "@/components/auto-refresh";
import { AnimatedKpi } from "@/components/animated-kpi";
import { AnimatedDelta } from "@/components/animated-delta";
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

function deltaClass(value: number, higherIsBetter = true) {
  if (value === 0) return "neutral";
  if (higherIsBetter) return value > 0 ? "positive" : "negative";
  return value < 0 ? "positive" : "negative";
}

export default async function HomePage() {
  const rows = await getBenchmarks();
  const sortedRows = [...rows].sort((a, b) => {
    if (b.overholdelse_pct !== a.overholdelse_pct) {
      return b.overholdelse_pct - a.overholdelse_pct;
    }
    return b.resolved_cases - a.resolved_cases;
  });

  const latestUpdate = rows
    .map((row) => row.updated_at)
    .filter((value): value is string => Boolean(value))
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];

  const teamA = sortedRows[0] ?? null;
  const teamB = sortedRows[1] ?? null;
  const leadDelta =
    teamA && teamB ? teamA.overholdelse_pct - teamB.overholdelse_pct : 0;

  const metricsRows: { label: string; key: string }[] = [
    { label: "Handled calls", key: "incoming_cases" },
    { label: "Kept", key: "resolved_cases" },
    { label: "Negotiation", key: "open_backlog" },
    { label: "Wrap-up", key: "avg_handle_minutes" },
  ];

  function formatMetric(value: number, key: string) {
    if (key === "avg_handle_minutes") return `${formatNumber(value * 60, 0)}s`;
    if (key === "resolved_cases" || key === "open_backlog") return `${formatNumber(value)}%`;
    return formatNumber(value);
  }

  return (
    <main className="editorial-shell editorial-fade-in">
      <AutoRefresh intervalMs={15000} />
      <header className="editorial-header">
        <h1 className="editorial-title">Benchmark</h1>
        <p className="editorial-meta">
          {latestUpdate
            ? new Intl.DateTimeFormat("nb-NO", {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(new Date(latestUpdate))
            : "Live"}
        </p>
        <div className="editorial-actions">
          <ThemeToggle />
          <TvModeToggle />
        </div>
      </header>

      {teamA && teamB && (
        <section className="editorial-hero" aria-label="Main KPI">
          <div
            className="editorial-hero-team editorial-hero-team--leading editorial-hero-fade"
            style={
              {
                "--team-primary": TEAM_THEME[teamA.team].primary,
                "--team-font": TEAM_THEME[teamA.team].fontVar,
              } as CSSProperties
            }
          >
            <p className="editorial-hero-name">{teamA.team_name}</p>
            <p className="editorial-hero-kpi">
              <AnimatedKpi value={teamA.overholdelse_pct} />
            </p>
          </div>

          <div className="editorial-hero-delta-wrap" key={`delta-${leadDelta}`}>
            <span className="editorial-delta-line" aria-hidden />
            <div className={`editorial-hero-delta editorial-delta-transition editorial-delta-change ${deltaClass(leadDelta, true)}`}>
              <AnimatedDelta value={leadDelta} />
            </div>
            <span className="editorial-delta-line" aria-hidden />
          </div>

          <div
            className="editorial-hero-team editorial-hero-fade"
            style={
              {
                "--team-primary": TEAM_THEME[teamB.team].primary,
                "--team-font": TEAM_THEME[teamB.team].fontVar,
              } as CSSProperties
            }
          >
            <p className="editorial-hero-name">{teamB.team_name}</p>
            <p className="editorial-hero-kpi">
              <AnimatedKpi value={teamB.overholdelse_pct} />
            </p>
          </div>
        </section>
      )}

      {teamA && teamB && (
        <section className="editorial-metrics editorial-metrics-fade">
          {metricsRows.map(({ label, key }) => {
            const aVal = teamA[key as keyof typeof teamA] as number;
            const bVal = teamB[key as keyof typeof teamB] as number;
            return (
              <div key={key} className="editorial-metric-row">
                <span className="editorial-metric-label">{label}</span>
                <span className="editorial-metric-val">{formatMetric(aVal, key)}</span>
                <span className="editorial-metric-sep" aria-hidden>|</span>
                <span className="editorial-metric-val">{formatMetric(bVal, key)}</span>
              </div>
            );
          })}
        </section>
      )}

      {sortedRows.length < 2 && (
        <p className="editorial-empty">Waiting for second team.</p>
      )}
    </main>
  );
}
