"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
    <section className="admin-shell">
      <form className="admin-card" onSubmit={onSubmit}>
        <h1 style={{ marginTop: 0 }}>Admin</h1>
        <p className="wallboard-subtle">
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
          <p style={{ color: "#ff8f8f", marginTop: 0, marginBottom: "0.6rem" }}>
            {error}
          </p>
        ) : null}
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Unlock Admin"}
        </button>
      </form>
    </section>
  );
}
