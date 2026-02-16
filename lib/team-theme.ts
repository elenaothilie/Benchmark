import type { TeamId } from "@/lib/types";

export const TEAM_THEME: Record<
  TeamId,
  { fontVar: string; primary: string; accent: string; deep: string; mid: string }
> = {
  avida: {
    fontVar: "var(--font-sans)",
    primary: "var(--avida-primary)",
    accent: "var(--avida-accent)",
    deep: "var(--avida-deep)",
    mid: "var(--avida-mid)",
  },
  santander: {
    fontVar: "var(--font-sans)",
    primary: "var(--santander-primary)",
    accent: "var(--santander-accent)",
    deep: "var(--santander-deep)",
    mid: "var(--santander-mid)",
  },
};
