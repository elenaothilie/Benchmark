import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { ADMIN_COOKIE, verifySessionToken } from "@/lib/admin-session";
import { updateBenchmark } from "@/lib/supabase-rest";
import type { TeamUpdatePayload } from "@/lib/types";

function isValidPayload(payload: TeamUpdatePayload) {
  const validTeam = payload.team === "avida" || payload.team === "santander";
  return (
    validTeam &&
    typeof payload.team_name === "string" &&
    typeof payload.overholdelse_pct === "number" &&
    typeof payload.incoming_cases === "number" &&
    typeof payload.resolved_cases === "number" &&
    typeof payload.open_backlog === "number" &&
    typeof payload.avg_handle_minutes === "number"
  );
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!verifySessionToken(token)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const payload = (await request.json()) as TeamUpdatePayload;
  if (!isValidPayload(payload)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  try {
    await updateBenchmark(payload);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
