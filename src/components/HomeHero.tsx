"use client"

import Link from "next/link"
import { useT } from "./LanguageProvider"
import styles from "@/app/page.module.css"

export type HeroStats = { notes: number; links: number; tags: number }

export const HomeHero = ({ stats }: { stats: HeroStats }) => {
  const t = useT()
  const items = [
    { n: stats.notes, label: t("home.statNotes") },
    { n: stats.links, label: t("home.statLinks") },
    { n: stats.tags, label: t("home.statTags") },
  ]

  return (
    <>
      <p className={styles.eyebrow}>{t("home.eyebrow")}</p>
      <div className={styles.name}>
        <h1 className={styles.lastName}>Bilguuntushiq</h1>
      </div>
      <p>{t("home.intro")}</p>
      <div className={styles.heroStats}>
        {items.map((it) => (
          <span key={it.label} className={styles.heroStat}>
            <span className={styles.heroStatNum}>{it.n}</span> {it.label}
          </span>
        ))}
      </div>
      <div className={styles.heroActions}>
        <Link href="/tags" className={styles.heroCta}>
          {t("home.exploreGraph")}
          <span className={styles.heroCtaArrow}>→</span>
        </Link>
        <Link href="/about" className={`${styles.heroCta} ${styles.heroCtaGhost}`}>
          {t("nav.about")}
        </Link>
      </div>
    </>
  )
}
