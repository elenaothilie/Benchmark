"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "wallboard_tv_mode";

async function enterFullscreen() {
  const root = document.documentElement as HTMLElement & {
    webkitRequestFullscreen?: () => Promise<void> | void;
  };

  if (document.fullscreenElement) return;
  if (root.requestFullscreen) {
    await root.requestFullscreen();
    return;
  }
  if (root.webkitRequestFullscreen) {
    await root.webkitRequestFullscreen();
  }
}

async function exitFullscreen() {
  const doc = document as Document & {
    webkitExitFullscreen?: () => Promise<void> | void;
  };

  if (!doc.fullscreenElement) return;
  if (doc.exitFullscreen) {
    await doc.exitFullscreen();
    return;
  }
  if (doc.webkitExitFullscreen) {
    await doc.webkitExitFullscreen();
  }
}

export function TvModeToggle() {
  const [enabled, setEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, enabled ? "1" : "0");
    document.body.classList.toggle("tv-mode", enabled);

    if (enabled) {
      void enterFullscreen().catch(() => {
        // Fullscreen can fail if browser blocks it.
      });
    } else {
      void exitFullscreen().catch(() => {
        // Ignore failures and keep layout mode toggled.
      });
    }
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

  useEffect(() => {
    function onFullscreenChange() {
      const isFullscreen = Boolean(document.fullscreenElement);
      if (!isFullscreen) {
        setEnabled(false);
      }
    }

    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", onFullscreenChange);
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
