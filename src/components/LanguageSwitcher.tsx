"use client"

import { useLanguage } from "./LanguageProvider"
import { locales, localeLabels, type Locale } from "@/lib/i18n"
import styles from "./Nav.module.css"

export const LanguageSwitcher = ({ mobile = false }: { mobile?: boolean }) => {
  const { locale, setLocale } = useLanguage()

  if (mobile) {
    return (
      <div className={styles.mobileLang}>
        {locales.map((l) => (
          <button
            key={l}
            className={styles.mobileLangBtn}
            data-active={locale === l}
            onClick={() => setLocale(l as Locale)}
            aria-label={`Switch to ${localeLabels[l as Locale]}`}
          >
            {localeLabels[l as Locale]}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className={styles.langSection}>
      {locales.map((l) => (
        <button
          key={l}
          className={styles.langBtn}
          data-active={locale === l}
          onClick={() => setLocale(l as Locale)}
          aria-label={`Switch to ${localeLabels[l as Locale]}`}
        >
          {localeLabels[l as Locale]}
        </button>
      ))}
    </div>
  )
}
