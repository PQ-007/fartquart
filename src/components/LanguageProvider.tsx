"use client"

import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react"
import { t as translate, defaultLocale, locales, type Locale } from "@/lib/i18n"

type LangContextType = {
  locale: Locale
  setLocale: (l: Locale) => void
}

const KEY = "locale"

// Same store pattern as ThemeProvider: localStorage holds the choice, the
// layout's bootstrap script applies it to <html> before paint, and React picks
// it up after hydration without an effect-driven setState.
const listeners = new Set<() => void>()

const subscribe = (onChange: () => void) => {
  listeners.add(onChange)
  window.addEventListener("storage", onChange)
  return () => {
    listeners.delete(onChange)
    window.removeEventListener("storage", onChange)
  }
}

const readLocale = (): Locale => {
  try {
    const stored = localStorage.getItem(KEY)
    return (locales as string[]).includes(stored ?? "")
      ? (stored as Locale)
      : defaultLocale
  } catch {
    return defaultLocale
  }
}

const LangContext = createContext<LangContextType>({
  locale: defaultLocale,
  setLocale: () => {},
})

export const useLanguage = () => useContext(LangContext)

export const useT = () => {
  const { locale } = useLanguage()
  return useCallback((key: string) => translate(locale, key), [locale])
}

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const locale = useSyncExternalStore(subscribe, readLocale, () => defaultLocale)

  const setLocale = useCallback((l: Locale) => {
    try {
      localStorage.setItem(KEY, l)
    } catch {
      // private mode — the switch still applies for this page view
    }
    document.cookie = `${KEY}=${l};path=/;max-age=31536000`
    document.documentElement.setAttribute("data-lang", l)
    document.documentElement.setAttribute("lang", l)
    for (const notify of listeners) notify()
  }, [])

  return (
    <LangContext.Provider value={{ locale, setLocale }}>
      {children}
    </LangContext.Provider>
  )
}
