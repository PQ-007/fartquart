import { cookies } from "next/headers"
import { defaultLocale, locales, type Locale } from "./i18n"

/** Read the active locale from the cookie (set by LanguageProvider), server-side. */
export const getServerLocale = async (): Promise<Locale> => {
  const value = (await cookies()).get("locale")?.value
  return (locales as string[]).includes(value ?? "") ? (value as Locale) : defaultLocale
}
