"use client"

import Link from "next/link"
import type { BlogMeta } from "@/lib/content"
import { postPath } from "@/lib/url"
import { localeLabels, type Locale } from "@/lib/i18n"
import { useT } from "./LanguageProvider"
import styles from "./TranslationSwitcher.module.css"

const langLabel = (lang?: string): string =>
  lang && lang in localeLabels ? localeLabels[lang as Locale] : (lang ?? "—")

export const TranslationSwitcher = ({
  siblings,
  currentSlug,
}: {
  siblings: BlogMeta[]
  currentSlug: string
}) => {
  const t = useT()
  if (siblings.length < 2) return null

  return (
    <div className={styles.switcher}>
      <span className={styles.label}>{t("ui.readIn")}</span>
      <div className={styles.langs}>
        {siblings.map((s) =>
          s.slug === currentSlug ? (
            <span key={s.slug} className={styles.current}>
              {langLabel(s.lang)}
            </span>
          ) : (
            <Link key={s.slug} href={postPath(s.slug, s.label)} className={styles.link}>
              {langLabel(s.lang)}
            </Link>
          ),
        )}
      </div>
    </div>
  )
}
