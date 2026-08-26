"use client";

import { useLocale, setLocaleCookie } from "@/components/locale-provider";

export function LocaleToggle({ className }: { className?: string }) {
  const locale = useLocale();
  const next = locale === "en" ? "ko" : "en";
  const nextLabel = next === "ko" ? "Korean" : "English";

  return (
    <button
      type="button"
      data-cursor="true"
      onClick={() => setLocaleCookie(next)}
      className={className}
      aria-label={`Switch to ${nextLabel}`}
      title={`Switch to ${nextLabel}`}
    >
      <span aria-hidden="true" className="text-[17px] leading-none">
        {next === "ko" ? "🇰🇷" : "🇺🇸"}
      </span>
    </button>
  );
}
