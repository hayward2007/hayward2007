"use client";

import { useMemo, useState } from "react";

// Each category's units store a factor to convert 1 unit into that category's
// base unit — converting is then just (value * fromFactor) / toFactor.
const CATEGORIES = {
  angle: {
    label: "Angle",
    base: "rad",
    units: { deg: Math.PI / 180, rad: 1, grad: Math.PI / 200, rev: Math.PI * 2 },
  },
  length: {
    label: "Length",
    base: "m",
    units: { mm: 0.001, cm: 0.01, m: 1, km: 1000, in: 0.0254, ft: 0.3048, yd: 0.9144 },
  },
  mass: {
    label: "Mass",
    base: "kg",
    units: { g: 0.001, kg: 1, lb: 0.453592, oz: 0.0283495 },
  },
  torque: {
    label: "Torque",
    base: "N·m",
    units: { "N·m": 1, "kgf·cm": 0.0980665, "lbf·ft": 1.355818, "lbf·in": 0.112985 },
  },
} as const;

type CategoryKey = keyof typeof CATEGORIES;

export function UnitConverterTool() {
  const [category, setCategory] = useState<CategoryKey>("angle");
  const units = Object.keys(CATEGORIES[category].units);
  const [from, setFrom] = useState(units[0]);
  const [to, setTo] = useState(units[1] ?? units[0]);
  const [value, setValue] = useState("1");

  function onCategoryChange(next: CategoryKey) {
    const nextUnits = Object.keys(CATEGORIES[next].units);
    setCategory(next);
    setFrom(nextUnits[0]);
    setTo(nextUnits[1] ?? nextUnits[0]);
  }

  const result = useMemo(() => {
    const num = Number(value);
    if (!Number.isFinite(num)) return null;
    const table = CATEGORIES[category].units as Record<string, number>;
    const fromFactor = table[from];
    const toFactor = table[to];
    if (fromFactor === undefined || toFactor === undefined) return null;
    return (num * fromFactor) / toFactor;
  }, [category, from, to, value]);

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex flex-wrap gap-2">
        {(Object.keys(CATEGORIES) as CategoryKey[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => onCategoryChange(key)}
            className="rounded-full border px-3 py-1.5 text-sm"
            style={{
              borderColor: "var(--line-strong)",
              background: category === key ? "var(--fg)" : "transparent",
              color: category === key ? "var(--bg)" : "var(--fg)",
            }}
          >
            {CATEGORIES[key].label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3">
        <div>
          <label className="text-sm" style={{ color: "var(--fg-3)" }}>
            From
          </label>
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="mt-2 w-full rounded-lg border p-2.5 text-sm"
            style={{ borderColor: "var(--line-strong)", background: "var(--bg-raised)" }}
          />
          <select
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="mt-2 w-full rounded-lg border p-2.5 text-sm"
            style={{ borderColor: "var(--line-strong)", background: "var(--bg-raised)" }}
          >
            {units.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>

        <span className="pb-3 font-mono text-sm" style={{ color: "var(--fg-3)" }}>
          =
        </span>

        <div>
          <label className="text-sm" style={{ color: "var(--fg-3)" }}>
            To
          </label>
          <p className="mt-2 truncate rounded-lg border p-2.5 text-sm font-medium" style={{ borderColor: "var(--line-strong)" }}>
            {result === null ? "—" : trimNumber(result)}
          </p>
          <select
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="mt-2 w-full rounded-lg border p-2.5 text-sm"
            style={{ borderColor: "var(--line-strong)", background: "var(--bg-raised)" }}
          >
            {units.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

function trimNumber(n: number) {
  if (Math.abs(n) >= 1e6 || (Math.abs(n) < 1e-4 && n !== 0)) return n.toExponential(4);
  return String(Math.round(n * 1e6) / 1e6);
}
