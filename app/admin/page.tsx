import { cookies } from "next/headers";

import { AdminEditor } from "@/components/admin-editor";
import { AdminLoginForm } from "@/components/admin-login-form";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/admin-session";
import { getBenchmarks } from "@/lib/supabase-rest";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  const authenticated = verifySessionToken(token);

  if (!authenticated) {
    return <AdminLoginForm />;
  }

  const rows = await getBenchmarks();
  return <AdminEditor initialRows={rows} />;
}
