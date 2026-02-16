"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { ThemeToggle } from "@/components/theme-toggle";
import { TvModeToggle } from "@/components/tv-mode-toggle";

export function AdminLoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    setLoading(false);
    if (!response.ok) {
      setError("Wrong password.");
      return;
    }

    setPassword("");
    router.refresh();
  }

  return (
    <main className="editorial-shell editorial-fade-in">
      <header className="editorial-header">
        <h1 className="editorial-title">Benchmark</h1>
        <p className="editorial-meta">Admin</p>
        <div className="editorial-actions">
          <ThemeToggle />
          <TvModeToggle />
        </div>
      </header>

      <section className="admin-login-center">
        <form className="admin-card" onSubmit={onSubmit}>
          <h2 className="editorial-hero-name" style={{ marginBottom: "0.5rem" }}>
            Unlock Admin
          </h2>
          <p className="editorial-metric-label" style={{ marginBottom: "1rem" }}>
            Update wallboard numbers for Team Avida and Team Santander.
          </p>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter admin password"
              autoComplete="current-password"
              required
            />
          </div>
          {error ? (
            <p className="admin-login-error">{error}</p>
          ) : null}
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginTop: "1rem" }}>
            {loading ? "Signing in…" : "Unlock Admin"}
          </button>
        </form>
      </section>
    </main>
  );
}
