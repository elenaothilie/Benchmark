import "server-only";

import type { TeamBenchmark, TeamId, TeamUpdatePayload } from "@/lib/types";

type SupabaseConfig = {
  url: string;
  publishableKey: string;
  secretKey: string;
};

function getSupabaseConfig(): SupabaseConfig {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
  const publishableKey = (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    ""
  ).trim();
  const secretKey = (
    process.env.SUPABASE_SECRET_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    ""
  ).trim();

  return {
    url,
    publishableKey,
    secretKey,
  };
}

const DEFAULT_TEAMS: TeamBenchmark[] = [
  {
    team: "avida",
    team_name: "Team Avida",
    overholdelse_pct: 96.2,
    previous_month_pct: 95.1,
    best_month_pct: 97.4,
    incoming_cases: 418,
    resolved_cases: 407,
    open_backlog: 139,
    avg_handle_minutes: 7.8,
    updated_at: null,
  },
  {
    team: "santander",
    team_name: "Team Santander",
    overholdelse_pct: 94.7,
    previous_month_pct: 95.3,
    best_month_pct: 96.8,
    incoming_cases: 436,
    resolved_cases: 401,
    open_backlog: 152,
    avg_handle_minutes: 8.1,
    updated_at: null,
  },
];

function hasPublicConfig() {
  const { url, publishableKey } = getSupabaseConfig();
  return Boolean(url && publishableKey);
}

function hasServiceConfig() {
  const { url, secretKey } = getSupabaseConfig();
  return Boolean(url && secretKey);
}

export async function getBenchmarks(): Promise<TeamBenchmark[]> {
  if (!hasPublicConfig()) {
    return DEFAULT_TEAMS;
  }
  const { url, publishableKey } = getSupabaseConfig();

  const response = await fetch(
    `${url}/rest/v1/team_benchmarks?select=team,team_name,overholdelse_pct,previous_month_pct,best_month_pct,incoming_cases,resolved_cases,open_backlog,avg_handle_minutes,updated_at&order=team.asc`,
    {
      cache: "no-store",
      headers: {
        apikey: publishableKey,
        Authorization: `Bearer ${publishableKey}`,
      },
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to fetch team benchmarks: ${text}`);
  }

  const data = (await response.json()) as TeamBenchmark[];
  if (!data?.length) {
    return DEFAULT_TEAMS;
  }

  const map = new Map(data.map((entry) => [entry.team, entry]));
  return DEFAULT_TEAMS.map((entry) => map.get(entry.team) ?? entry);
}

export async function updateBenchmark(payload: TeamUpdatePayload) {
  const { url, secretKey } = getSupabaseConfig();
  if (!url || !secretKey) {
    throw new Error(
      `Missing Supabase server configuration. NEXT_PUBLIC_SUPABASE_URL set: ${Boolean(url)}. SUPABASE_SECRET_KEY/SUPABASE_SERVICE_ROLE_KEY set: ${Boolean(secretKey)}.`,
    );
  }

  const team = payload.team as TeamId;
  const response = await fetch(
    `${url}/rest/v1/team_benchmarks?team=eq.${team}`,
    {
      method: "PATCH",
      headers: {
        apikey: secretKey,
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        ...payload,
        previous_month_pct: payload.previous_month_pct,
        best_month_pct: payload.best_month_pct,
        updated_at: new Date().toISOString(),
      }),
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to update benchmark for ${team}: ${text}`);
  }

  const data = (await response.json()) as TeamBenchmark[];
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error(`No benchmark row found for team ${team}.`);
  }

  return data;
}
