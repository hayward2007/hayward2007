"use client";

import { useEffect, useState } from "react";

type Competition = {
  id: string;
  name: string;
  rank: string;
  rankLabel: string;
  year: string | null;
  priority: number;
};

const RANKS = ["gold", "silver", "bronze", "encouragement", "special", "none"];

export default function AdminCompetitionsPage() {
  const [competitions, setCompetitions] = useState<Competition[] | null>(null);

  useEffect(() => {
    fetch("/api/admin/competitions")
      .then((r) => r.json())
      .then((data) => setCompetitions(data.competitions));
  }, []);

  async function save(id: string, patch: Record<string, unknown>) {
    const res = await fetch(`/api/admin/competitions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (res.ok) {
      const data = await res.json();
      setCompetitions((prev) => prev?.map((c) => (c.id === id ? { ...c, ...data.competition } : c)) ?? prev);
    }
  }

  if (!competitions) return <p style={{ color: "var(--fg-3)" }}>Loading…</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Competitions</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--fg-3)" }}>
          Read from Notion; fix a misread rank or reorder priority here without touching Notion.
        </p>
      </div>
      <div className="divide-y" style={{ borderColor: "var(--line)" }}>
        {competitions.map((c) => (
          <div key={c.id} className="flex flex-wrap items-center gap-4 py-3">
            <div className="min-w-48 flex-1">
              <p className="font-medium">{c.name}</p>
              <p className="text-xs" style={{ color: "var(--fg-3)" }}>
                priority {c.priority}
              </p>
            </div>
            <input
              defaultValue={c.year ?? ""}
              placeholder="year"
              onBlur={(e) => save(c.id, { year: e.target.value })}
              className="w-20 rounded-lg border px-3 py-1.5 text-sm"
              style={{ borderColor: "var(--line-strong)" }}
            />
            <input
              type="number"
              defaultValue={c.priority}
              onBlur={(e) => save(c.id, { priority: e.target.value })}
              className="w-20 rounded-lg border px-3 py-1.5 text-sm"
              style={{ borderColor: "var(--line-strong)" }}
            />
            <select
              defaultValue={c.rank}
              onChange={(e) => save(c.id, { rank: e.target.value })}
              className="rounded-lg border px-3 py-1.5 text-sm"
              style={{ borderColor: "var(--line-strong)" }}
            >
              {RANKS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
