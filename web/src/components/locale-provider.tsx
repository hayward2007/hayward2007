"use client";

import { createContext, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import { LOCALE_COOKIE, getDictionary, normalizeLocale, type Locale } from "@/lib/i18n";

const LocaleContext = createContext<Locale>("en");

export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  return useContext(LocaleContext);
}

export function useDict() {
  const locale = useLocale();
  return useMemo(() => getDictionary(locale), [locale]);
}

export function setLocaleCookie(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${60 * 60 * 24 * 365}`;
  window.location.reload();
}

export function readLocaleFromDocumentCookie(): Locale {
  if (typeof document === "undefined") return "en";
  const match = document.cookie.match(new RegExp(`${LOCALE_COOKIE}=([^;]+)`));
  return normalizeLocale(match?.[1]);
}
