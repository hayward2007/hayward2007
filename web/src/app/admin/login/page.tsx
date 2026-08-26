"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

function LoginForm() {
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 429) setError("Too many attempts. Wait a few minutes and try again.");
        else if (data.error === "service_unavailable") setError("Admin sign-in is unavailable on the server.");
        else setError("Wrong password.");
        return;
      }

      const requestedNext = searchParams.get("next");
      const nextPath =
        requestedNext?.startsWith("/admin") && !requestedNext.startsWith("//")
          ? requestedNext
          : "/admin";
      window.location.assign(nextPath);
    } catch {
      setError("Couldn't reach the server. Check the connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 rounded-lg border p-8" style={{ borderColor: "var(--line)" }}>
      <h1 className="type-card-title text-xl">Admin console</h1>
      <p className="text-sm" style={{ color: "var(--fg-3)" }}>
        Sign in to sync Notion data and edit the live site.
      </p>
      <label htmlFor="admin-password" className="sr-only">Password</label>
      <input
        id="admin-password"
        name="password"
        type="password"
        autoComplete="current-password"
        autoFocus
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        aria-describedby={error ? "admin-login-error" : undefined}
        aria-invalid={Boolean(error)}
        required
        className="w-full rounded-lg border px-3 py-2 text-sm"
        style={{ borderColor: "var(--line-strong)", background: "var(--bg)" }}
      />
      {error && <p id="admin-login-error" role="alert" className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={loading || !password}
        className="w-full rounded-lg py-2 text-sm font-medium"
        style={{ background: "var(--fg)", color: "var(--bg)" }}
      >
        {loading ? "Checking…" : "Sign in"}
      </button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
