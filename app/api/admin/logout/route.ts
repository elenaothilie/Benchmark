import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { ADMIN_COOKIE } from "@/lib/admin-session";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.set({
    name: ADMIN_COOKIE,
    value: "",
    path: "/",
    maxAge: 0,
  });

  return NextResponse.json({ ok: true });
}
