"use client"

import Link from "next/link"
import type { Backlink } from "@/lib/content"
import { useT } from "./LanguageProvider"
import styles from "./Backlinks.module.css"

/** Obsidian-style "linked mentions": notes whose wikilinks point here. */
export const Backlinks = ({ items }: { items: Backlink[] }) => {
  const t = useT()
  if (items.length === 0) return null

  return (
    <section className={styles.outer}>
      <div className={styles.inner}>
        <h2 className={styles.heading}>
          {t("ui.linkedMentions")}
          <span className={styles.count}>{items.length}</span>
        </h2>
        <ul className={styles.list}>
          {items.map((b) => (
            <li key={b.href}>
              <Link href={b.href} className={styles.item}>
                <span className={styles.dot} data-type={b.type} />
                <span className={styles.title}>{b.title}</span>
                <span className={styles.type}>{t(`graph.${b.type}`)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
