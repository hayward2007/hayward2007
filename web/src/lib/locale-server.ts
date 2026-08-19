import { cookies } from "next/headers";
import { LOCALE_COOKIE, normalizeLocale, getDictionary } from "@/lib/i18n";

export async function getServerLocale() {
  const store = await cookies();
  return normalizeLocale(store.get(LOCALE_COOKIE)?.value);
}

export async function getServerDict() {
  const locale = await getServerLocale();
  return { locale, dict: getDictionary(locale) };
}
