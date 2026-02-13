export type TeamId = "avida" | "santander";

export type TeamBenchmark = {
  team: TeamId;
  team_name: string;
  overholdelse_pct: number;
  previous_month_pct: number;
  best_month_pct: number;
  incoming_cases: number;
  resolved_cases: number;
  open_backlog: number;
  avg_handle_minutes: number;
  updated_at: string | null;
};

export type TeamUpdatePayload = Omit<TeamBenchmark, "updated_at">;
