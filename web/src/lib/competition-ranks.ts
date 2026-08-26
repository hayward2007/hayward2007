import type { Locale } from "@/lib/i18n";

const COMPETITION_RANK_LABELS: Record<string, Record<Locale, string>> = {
  gold: { en: "Gold", ko: "금상" },
  silver: { en: "Silver", ko: "은상" },
  bronze: { en: "Bronze", ko: "동상" },
  encouragement: { en: "Encouragement", ko: "장려상" },
  special: { en: "Award", ko: "수상" },
  none: { en: "Participated", ko: "참가" },
};

export function getCompetitionRankLabel(rank: string, fallback: string, locale: Locale) {
  return COMPETITION_RANK_LABELS[rank]?.[locale] || fallback;
}
