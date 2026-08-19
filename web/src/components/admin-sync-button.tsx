"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminSyncButton() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSync() {
    setStatus("loading");
    setMessage("");
    const res = await fetch("/api/admin/sync", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setStatus("error");
      setMessage(data.message || data.hint || "Sync failed.");
      return;
    }
    setStatus("done");
    setMessage(`Synced ${data.projectCount} projects, ${data.competitionCount} competitions, ${data.activityCount} activities.`);
    router.refresh();
  }

  return (
    <div>
      <button
        type="button"
        onClick={onSync}
        disabled={status === "loading"}
        className="rounded-lg px-4 py-2 text-sm font-medium"
        style={{ background: "var(--fg)", color: "var(--bg)" }}
      >
        {status === "loading" ? "Syncing from Notion…" : "Sync from Notion"}
      </button>
      {message && (
        <p className="mt-2 text-sm" style={{ color: status === "error" ? "#e0562c" : "var(--fg-3)" }}>
          {message}
        </p>
      )}
    </div>
  );
}
