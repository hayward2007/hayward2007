"use client";

import { useLocale, setLocaleCookie } from "@/components/locale-provider";

export function LocaleToggle({ className }: { className?: string }) {
  const locale = useLocale();
  const next = locale === "en" ? "ko" : "en";

  return (
    <button
      type="button"
      data-cursor="true"
      onClick={() => setLocaleCookie(next)}
      className={className}
      aria-label={`Switch to ${next === "ko" ? "Korean" : "English"}`}
    >
      {locale === "en" ? "KO" : "EN"}
    </button>
  );
}
