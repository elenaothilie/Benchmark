"use client";

import { useTheme } from "@/components/theme-provider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      className="btn btn-muted theme-toggle"
      onClick={toggleTheme}
      aria-pressed={theme === "light"}
      title="Toggle light/dark background"
    >
      {theme === "dark" ? "Light" : "Dark"}
    </button>
  );
}
