"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "wallboard_tv_mode";

export function TvModeToggle() {
  const [enabled, setEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, enabled ? "1" : "0");
    document.body.classList.toggle("tv-mode", enabled);
  }, [enabled]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "t") {
        setEnabled((prev) => !prev);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <button
      type="button"
      className="btn btn-muted tv-toggle"
      onClick={() => setEnabled((prev) => !prev)}
      aria-pressed={enabled}
      title="Toggle TV mode (shortcut: T)"
    >
      TV mode: {enabled ? "On" : "Off"}
    </button>
  );
}
