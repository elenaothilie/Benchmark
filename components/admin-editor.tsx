"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { ThemeToggle } from "@/components/theme-toggle";
import { TvModeToggle } from "@/components/tv-mode-toggle";
import { TEAM_THEME } from "@/lib/team-theme";
import type { TeamBenchmark, TeamId } from "@/lib/types";
import type { CSSProperties } from "react";

type Props = {
  initialRows: TeamBenchmark[];
};

type RowState = Record<TeamId, TeamBenchmark>;

function toState(rows: TeamBenchmark[]): RowState {
  return {
    avida:
      rows.find((row) => row.team === "avida") ??
      ({
        team: "avida",
        team_name: "Team Avida",
        overholdelse_pct: 0,
        previous_month_pct: 0,
        best_month_pct: 0,
        incoming_cases: 0,
        resolved_cases: 0,
        open_backlog: 0,
        avg_handle_minutes: 0,
        updated_at: null,
      } as TeamBenchmark),
    santander:
      rows.find((row) => row.team === "santander") ??
      ({
        team: "santander",
        team_name: "Team Santander",
        overholdelse_pct: 0,
        previous_month_pct: 0,
        best_month_pct: 0,
        incoming_cases: 0,
        resolved_cases: 0,
        open_backlog: 0,
        avg_handle_minutes: 0,
        updated_at: null,
      } as TeamBenchmark),
  };
}

function formatSigned(value: number) {
  if (value === 0) return "0.0";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}`;
}

function deltaClass(value: number, higherIsBetter = true) {
  if (value === 0) return "neutral";
  if (higherIsBetter) return value > 0 ? "positive" : "negative";
  return value < 0 ? "positive" : "negative";
}

const METRICS_ROWS: { label: string; key: keyof TeamBenchmark }[] = [
  { label: "Handled calls", key: "incoming_cases" },
  { label: "Kept", key: "resolved_cases" },
  { label: "Negotiation", key: "open_backlog" },
  { label: "Wrap-up", key: "avg_handle_minutes" },
];

export function AdminEditor({ initialRows }: Props) {
  const router = useRouter();
  const [rows, setRows] = useState<RowState>(() => toState(initialRows));
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  const sorted = [rows.avida, rows.santander].sort((a, b) => {
    if (b.overholdelse_pct !== a.overholdelse_pct) {
      return b.overholdelse_pct - a.overholdelse_pct;
    }
    return b.resolved_cases - a.resolved_cases;
  });
  const teamA = sorted[0]!;
  const teamB = sorted[1]!;
  const leadDelta = teamA.overholdelse_pct - teamB.overholdelse_pct;

  const latestUpdate = [teamA.updated_at, teamB.updated_at]
    .filter((v): v is string => Boolean(v))
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];

  function setValue(team: TeamId, key: keyof TeamBenchmark, value: string) {
    const parsed = Number(value.replace(",", "."));
    setRows((prev) => ({
      ...prev,
      [team]: {
        ...prev[team],
        [key]: Number.isNaN(parsed) ? 0 : parsed,
      },
    }));
  }

  async function saveAll(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setStatus("");

    for (const team of ["avida", "santander"] as const) {
      const payload = rows[team];
      const response = await fetch("/api/admin/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json().catch(() => null)) as { message?: string } | null;

      if (!response.ok) {
        setSaving(false);
        setStatus(result?.message ? `Failed: ${result.message}` : "Failed to save.");
        return;
      }
    }

    setSaving(false);
    setStatus("Saved.");
    router.refresh();
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  return (
    <main className="editorial-shell editorial-fade-in">
      <form onSubmit={saveAll} className="editorial-admin-form">
        <header className="editorial-header">
          <h1 className="editorial-title">Benchmark</h1>
          <div className="editorial-header-center">
            <p className="editorial-meta">
              {latestUpdate
                ? new Intl.DateTimeFormat("nb-NO", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(new Date(latestUpdate))
                : "Live"}
            </p>
            {status ? <span className="editorial-admin-status">{status}</span> : null}
          </div>
          <div className="editorial-actions">
            <ThemeToggle />
            <TvModeToggle />
            <button className="btn btn-muted theme-toggle" type="button" onClick={logout}>
              Log out
            </button>
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </header>

        <section className="editorial-hero" aria-label="Main KPI">
          <div
            className="editorial-hero-team editorial-hero-team--leading"
            style={
              {
                "--team-primary": TEAM_THEME[teamA.team].primary,
                "--team-font": TEAM_THEME[teamA.team].fontVar,
              } as CSSProperties
            }
          >
            <p className="editorial-hero-name">{teamA.team_name}</p>
            <label className="editorial-hero-kpi editorial-admin-kpi-input">
              <input
                type="text"
                inputMode="decimal"
                value={teamA.overholdelse_pct}
                onChange={(e) => setValue(teamA.team, "overholdelse_pct", e.target.value)}
                aria-label={`${teamA.team_name} KPI`}
              />
              <span className="kpi-suffix" aria-hidden>%</span>
            </label>
            <div className="editorial-hero-context">
              <div className="editorial-hero-context-row">
                <span className="editorial-metric-label">Best month</span>
                <label className="editorial-metric-val editorial-admin-metric-input">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={teamA.best_month_pct}
                    onChange={(e) => setValue(teamA.team, "best_month_pct", e.target.value)}
                    aria-label={`Best month ${teamA.team_name}`}
                  />
                  %
                </label>
              </div>
              <div className="editorial-hero-context-row">
                <span className="editorial-metric-label">Last month</span>
                <label className="editorial-metric-val editorial-admin-metric-input">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={teamA.previous_month_pct}
                    onChange={(e) => setValue(teamA.team, "previous_month_pct", e.target.value)}
                    aria-label={`Last month ${teamA.team_name}`}
                  />
                  %
                </label>
              </div>
            </div>
          </div>

          <div className="editorial-hero-delta-wrap">
            <span className="editorial-delta-line" aria-hidden />
            <div className={`editorial-hero-delta ${deltaClass(leadDelta, true)}`}>
              {formatSigned(leadDelta)} LEAD
            </div>
            <span className="editorial-delta-line" aria-hidden />
          </div>

          <div
            className="editorial-hero-team"
            style={
              {
                "--team-primary": TEAM_THEME[teamB.team].primary,
                "--team-font": TEAM_THEME[teamB.team].fontVar,
              } as CSSProperties
            }
          >
            <p className="editorial-hero-name">{teamB.team_name}</p>
            <label className="editorial-hero-kpi editorial-admin-kpi-input">
              <input
                type="text"
                inputMode="decimal"
                value={teamB.overholdelse_pct}
                onChange={(e) => setValue(teamB.team, "overholdelse_pct", e.target.value)}
                aria-label={`${teamB.team_name} KPI`}
              />
              <span className="kpi-suffix" aria-hidden>%</span>
            </label>
            <div className="editorial-hero-context">
              <div className="editorial-hero-context-row">
                <span className="editorial-metric-label">Best month</span>
                <label className="editorial-metric-val editorial-admin-metric-input">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={teamB.best_month_pct}
                    onChange={(e) => setValue(teamB.team, "best_month_pct", e.target.value)}
                    aria-label={`Best month ${teamB.team_name}`}
                  />
                  %
                </label>
              </div>
              <div className="editorial-hero-context-row">
                <span className="editorial-metric-label">Last month</span>
                <label className="editorial-metric-val editorial-admin-metric-input">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={teamB.previous_month_pct}
                    onChange={(e) => setValue(teamB.team, "previous_month_pct", e.target.value)}
                    aria-label={`Last month ${teamB.team_name}`}
                  />
                  %
                </label>
              </div>
            </div>
          </div>
        </section>

        <section className="editorial-metrics editorial-metrics-fade">
          {METRICS_ROWS.map(({ label, key }) => {
            const isWrapUp = key === "avg_handle_minutes";
            const aVal = teamA[key as keyof TeamBenchmark] as number;
            const bVal = teamB[key as keyof TeamBenchmark] as number;
            const displayA = isWrapUp ? aVal * 60 : aVal;
            const displayB = isWrapUp ? bVal * 60 : bVal;
            const handleChangeA = (v: string) =>
              setValue(teamA.team, key, isWrapUp ? String(Number(v.replace(",", ".")) / 60) : v);
            const handleChangeB = (v: string) =>
              setValue(teamB.team, key, isWrapUp ? String(Number(v.replace(",", ".")) / 60) : v);
            return (
              <div key={key} className="editorial-metric-row editorial-admin-metric-row">
                <span className="editorial-metric-label">{label}</span>
                <label className="editorial-metric-val editorial-admin-metric-input">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={displayA}
                    onChange={(e) => handleChangeA(e.target.value)}
                    aria-label={`${label} ${teamA.team_name}`}
                  />
                  {isWrapUp ? "s" : key === "resolved_cases" || key === "open_backlog" ? "%" : null}
                </label>
                <span className="editorial-metric-sep" aria-hidden>|</span>
                <label className="editorial-metric-val editorial-admin-metric-input">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={displayB}
                    onChange={(e) => handleChangeB(e.target.value)}
                    aria-label={`${label} ${teamB.team_name}`}
                  />
                  {isWrapUp ? "s" : key === "resolved_cases" || key === "open_backlog" ? "%" : null}
                </label>
              </div>
            );
          })}
        </section>
      </form>
    </main>
  );
}
