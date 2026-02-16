import { getBenchmarks } from "@/lib/supabase-rest";
import { Dashboard } from "@/components/dashboard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const rows = await getBenchmarks();
  return <Dashboard initialRows={rows} />;
}
