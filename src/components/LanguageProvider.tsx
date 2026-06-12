"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import { t as translate, defaultLocale, locales, type Locale } from "@/lib/i18n"

type LangContextType = {
  locale: Locale
  setLocale: (l: Locale) => void
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
  const [locale, setLocaleState] = useState<Locale>(defaultLocale)

  useEffect(() => {
    const stored = localStorage.getItem("locale") as Locale | null
    if (stored && (locales as string[]).includes(stored)) {
      setLocaleState(stored)
      document.documentElement.setAttribute("data-lang", stored)
      document.documentElement.setAttribute("lang", stored)
    }
  }, [])

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l)
    localStorage.setItem("locale", l)
    document.documentElement.setAttribute("data-lang", l)
    document.documentElement.setAttribute("lang", l)
  }, [])

  return (
    <LangContext.Provider value={{ locale, setLocale }}>
      {children}
    </LangContext.Provider>
  )
}
