"use client"

import { useTheme } from "./ThemeProvider"
import { useLanguage, useT } from "./LanguageProvider"
import { locales, localeLabels, type Locale } from "@/lib/i18n"
import styles from "./SettingsPanel.module.css"

export const SettingsPanel = ({ onClose }: { onClose: () => void }) => {
  const { theme, toggleTheme } = useTheme()
  const { locale, setLocale } = useLanguage()
  const t = useT()

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={styles.panel}>
        <div className={styles.section}>
          <p className={styles.sectionLabel}>{t("settings.theme")}</p>
          <div className={styles.options}>
            <button
              className={styles.optBtn}
              data-active={theme === "dark"}
              onClick={() => theme !== "dark" && toggleTheme()}
            >
              {t("settings.dark")}
            </button>
            <button
              className={styles.optBtn}
              data-active={theme === "light"}
              onClick={() => theme !== "light" && toggleTheme()}
            >
              {t("settings.light")}
            </button>
          </div>
        </div>

        <div className={styles.section}>
          <p className={styles.sectionLabel}>{t("settings.language")}</p>
          <div className={styles.options}>
            {locales.map((l) => (
              <button
                key={l}
                className={styles.optBtn}
                data-active={locale === l}
                onClick={() => setLocale(l as Locale)}
              >
                {localeLabels[l as Locale]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
