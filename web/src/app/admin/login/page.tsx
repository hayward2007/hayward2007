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
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error === "admin_not_configured" ? "Admin password is not configured on the server." : "Wrong password.");
      return;
    }
    // Hard navigation: guarantees the freshly-set session cookie is present on the
    // very next request, sidestepping any client-router-cache staleness.
    window.location.href = searchParams.get("next") || "/admin";
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 rounded-2xl border p-8" style={{ borderColor: "var(--line)" }}>
      <h1 className="text-lg font-semibold">Admin console</h1>
      <p className="text-sm" style={{ color: "var(--fg-3)" }}>
        Sign in to sync Notion data and edit the live site.
      </p>
      <input
        type="password"
        autoFocus
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full rounded-lg border px-3 py-2 text-sm"
        style={{ borderColor: "var(--line-strong)", background: "var(--bg)" }}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={loading}
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
