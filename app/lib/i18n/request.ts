import { cookies, headers } from "next/headers";
import { defaultLocale, detectLocale, isLocale, type Locale } from "./config";

const LOCALE_COOKIE = "yas-locale";

export async function getRequestLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const savedLocale = cookieStore.get(LOCALE_COOKIE)?.value;

  if (savedLocale && isLocale(savedLocale)) {
    return savedLocale;
  }

  const requestHeaders = await headers();
  return detectLocale(requestHeaders.get("accept-language"));
}

export function getLocaleCookieName() {
  return LOCALE_COOKIE;
}

export function normalizeLocale(value: string | undefined): Locale {
  if (value && isLocale(value)) {
    return value;
  }

  return defaultLocale;
}
