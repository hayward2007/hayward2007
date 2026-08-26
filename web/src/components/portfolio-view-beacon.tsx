"use client";

import { useEffect } from "react";

export function PortfolioViewBeacon({ slug }: { slug: string }) {
  useEffect(() => {
    fetch(`/api/portfolio/${encodeURIComponent(slug)}`, {
      method: "POST",
      keepalive: true,
    }).catch(() => {
      // Analytics is best-effort and must never interrupt the shared portfolio.
    });
  }, [slug]);

  return null;
}
