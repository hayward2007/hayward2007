"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Check, ChevronsRight, Lock } from "lucide-react";

type InfoRow = { label: string; value?: string; protected?: "dob" | "phone" | "email" };

type RevealCopy = {
  maskedValue: string;
  sliderInstruction: string;
  verifying: string;
  revealedNote: string;
  error: string;
  rateLimited: string;
};

type Status = "idle" | "verifying" | "revealed" | "error" | "rate_limited";

const DRAG_COMPLETE_PCT = 96;

export function ProfileInfoTable({ rows, copy }: { rows: readonly InfoRow[]; copy: RevealCopy }) {
  const [revealed, setRevealed] = useState<Record<string, string> | null>(null);
  const [dragPct, setDragPct] = useState(0);
  const [status, setStatus] = useState<Status>("idle");
  const tokenRef = useRef<string | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const hasProtectedRows = rows.some((row) => row.protected);

  useEffect(() => {
    if (!hasProtectedRows) return;
    let cancelled = false;
    fetch("/api/portfolio/contact-challenge")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.token) tokenRef.current = data.token;
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [hasProtectedRows]);

  async function refreshToken() {
    try {
      const res = await fetch("/api/portfolio/contact-challenge");
      if (res.ok) {
        const data = await res.json();
        tokenRef.current = data.token ?? null;
      }
    } catch {
      tokenRef.current = null;
    }
  }

  async function verify() {
    const token = tokenRef.current;
    if (!token) {
      setStatus("error");
      setDragPct(0);
      await refreshToken();
      return;
    }

    setStatus("verifying");
    try {
      const res = await fetch("/api/portfolio/contact-reveal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (res.status === 429) {
        setStatus("rate_limited");
        setDragPct(0);
        return;
      }
      if (!res.ok) {
        setStatus("error");
        setDragPct(0);
        await refreshToken();
        return;
      }
      const data = await res.json();
      setRevealed(data);
      setStatus("revealed");
    } catch {
      setStatus("error");
      setDragPct(0);
      await refreshToken();
    }
  }

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (status === "verifying" || status === "revealed") return;
    draggingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (!draggingRef.current || !trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const pct = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
    setDragPct(pct);
    if (pct >= DRAG_COMPLETE_PCT) {
      draggingRef.current = false;
      verify();
    }
  }

  function onPointerUp() {
    draggingRef.current = false;
    if (dragPct < DRAG_COMPLETE_PCT && status !== "verifying" && status !== "revealed") setDragPct(0);
  }

  return (
    <div>
      <dl className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
        {rows.map((row) => {
          const value = row.protected ? revealed?.[row.protected] : row.value;
          return (
            <div
              key={row.label}
              className="flex items-baseline justify-between gap-4 border-b pb-2"
              style={{ borderColor: "var(--line)" }}
            >
              <dt className="shrink-0 text-xs" style={{ color: "var(--fg-3)" }}>
                {row.label}
              </dt>
              {value ? (
                <dd className="min-w-0 text-right text-sm font-medium">{value}</dd>
              ) : (
                <dd className="flex shrink-0 items-center gap-1.5 text-xs" style={{ color: "var(--fg-4)" }}>
                  <Lock aria-hidden="true" size={11} strokeWidth={2} />
                  {copy.maskedValue}
                </dd>
              )}
            </div>
          );
        })}
      </dl>

      {hasProtectedRows && status !== "revealed" && (
        <div className="mt-5">
          <div
            ref={trackRef}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
            className="relative h-11 w-full max-w-xs overflow-hidden rounded-full border select-none"
            style={{ borderColor: "var(--line-strong)", background: "var(--bg-raised)", touchAction: "none" }}
          >
            <div
              aria-hidden="true"
              className="absolute inset-y-0 left-0 rounded-full"
              style={{ width: `${dragPct}%`, background: "var(--accent-soft)" }}
            />
            <p
              className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs font-medium"
              style={{ color: "var(--fg-3)" }}
            >
              {status === "verifying" ? copy.verifying : copy.sliderInstruction}
            </p>
            <div
              onPointerDown={onPointerDown}
              data-cursor="true"
              className="absolute top-1 flex h-9 w-9 items-center justify-center rounded-full transition-[left] duration-100"
              style={{
                left: `calc(${dragPct}% * 0.86)`,
                background: "var(--fg)",
                color: "var(--bg)",
                cursor: status === "verifying" ? "wait" : "grab",
              }}
            >
              <ChevronsRight aria-hidden="true" size={16} strokeWidth={2} />
            </div>
          </div>
          {status === "error" && (
            <p className="mt-2 text-xs" style={{ color: "var(--accent-signal)" }}>
              {copy.error}
            </p>
          )}
          {status === "rate_limited" && (
            <p className="mt-2 text-xs" style={{ color: "var(--accent-signal)" }}>
              {copy.rateLimited}
            </p>
          )}
        </div>
      )}

      {hasProtectedRows && status === "revealed" && (
        <p className="mt-5 flex items-center gap-1.5 text-xs" style={{ color: "var(--fg-3)" }}>
          <Check aria-hidden="true" size={13} strokeWidth={2.2} style={{ color: "var(--accent-robotics)" }} />
          {copy.revealedNote}
        </p>
      )}
    </div>
  );
}
