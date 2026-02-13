"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { TeamBenchmark, TeamId } from "@/lib/types";

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
        incoming_cases: 0,
        resolved_cases: 0,
        open_backlog: 0,
        avg_handle_minutes: 0,
        updated_at: null,
      } as TeamBenchmark),
  };
}

export function AdminEditor({ initialRows }: Props) {
  const router = useRouter();
  const [rows, setRows] = useState<RowState>(() => toState(initialRows));
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  function setValue(team: TeamId, key: keyof TeamBenchmark, value: string) {
    const parsed = Number(value);
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

      if (!response.ok) {
        setSaving(false);
        setStatus(`Failed to update ${payload.team_name}.`);
        return;
      }
    }

    setSaving(false);
    setStatus("Saved successfully.");
    router.refresh();
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  return (
    <section className="admin-shell">
      <form className="admin-card" onSubmit={saveAll}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "0.8rem",
            gap: "0.8rem",
          }}
        >
          <div>
            <h1 style={{ margin: 0 }}>Admin - KPI Update</h1>
            <p className="wallboard-subtle" style={{ marginTop: "0.35rem" }}>
              Manual updates only. Changes are visible on the wallboard after the
              next refresh.
            </p>
          </div>
          <button className="btn btn-muted" onClick={logout} type="button">
            Log out
          </button>
        </div>

        <div className="admin-grid">
          {(["avida", "santander"] as const).map((teamId) => {
            const team = rows[teamId];
            return (
              <article key={teamId} className="admin-team">
                <h2 style={{ marginTop: 0 }}>{team.team_name}</h2>
                <div className="field">
                  <label>NET PAYRE RATIO</label>
                  <input
                    type="number"
                    step="0.1"
                    value={team.overholdelse_pct}
                    onChange={(event) =>
                      setValue(teamId, "overholdelse_pct", event.target.value)
                    }
                  />
                </div>
                <div className="field">
                  <label>Handled calls</label>
                  <input
                    type="number"
                    value={team.incoming_cases}
                    onChange={(event) =>
                      setValue(teamId, "incoming_cases", event.target.value)
                    }
                  />
                </div>
                <div className="field">
                  <label>Kept percentage</label>
                  <input
                    type="number"
                    value={team.resolved_cases}
                    onChange={(event) =>
                      setValue(teamId, "resolved_cases", event.target.value)
                    }
                  />
                </div>
                <div className="field">
                  <label>Negotiation rate</label>
                  <input
                    type="number"
                    value={team.open_backlog}
                    onChange={(event) =>
                      setValue(teamId, "open_backlog", event.target.value)
                    }
                  />
                </div>
                <div className="field" style={{ marginBottom: 0 }}>
                  <label>Wrap-up (min)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={team.avg_handle_minutes}
                    onChange={(event) =>
                      setValue(teamId, "avg_handle_minutes", event.target.value)
                    }
                  />
                </div>
              </article>
            );
          })}
        </div>

        <div
          style={{
            marginTop: "0.9rem",
            display: "flex",
            alignItems: "center",
            gap: "0.9rem",
          }}
        >
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save All"}
          </button>
          {status ? <p className="wallboard-subtle">{status}</p> : null}
        </div>
      </form>
    </section>
  );
}
