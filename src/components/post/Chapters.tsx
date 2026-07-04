"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import styles from "./Chapters.module.css"
import { SlidingText } from "../SlidingText"
import { TranslationSwitcher } from "../TranslationSwitcher"
import { useT } from "../LanguageProvider"
import type { Chapter } from "@/lib/toc"
import type { BlogMeta } from "@/lib/content"
import { CREATION_CATEGORY_LABEL, type CreationCategory } from "@/lib/categories"

export type { Chapter }

export type LogEntry = { slug: string; title: string }

export const Chapters = ({
  chapters,
  demo,
  repo,
  siblings,
  currentSlug,
  logs,
  logCategory,
  creationSlug,
}: {
  chapters: Chapter[]
  demo?: string
  repo?: string
  siblings?: BlogMeta[]
  currentSlug?: string
  logs?: LogEntry[]
  logCategory?: CreationCategory
  creationSlug?: string
}) => {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const listRef = useRef<HTMLUListElement>(null)
  const t = useT()

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement
      const max = doc.scrollHeight - window.innerHeight
      setProgress(max > 0 ? Math.min(window.scrollY / max, 1) : 0)

      let current: string | null = null
      for (const chapter of chapters) {
        const el = document.getElementById(chapter.id)
        if (el && el.getBoundingClientRect().top < 150) {
          current = chapter.id
        }
      }
      setActiveId(current)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [chapters])

  return (
    <aside className={styles.chapters}>
      <div className={styles.inner}>
        {siblings && currentSlug && (
          <TranslationSwitcher siblings={siblings} currentSlug={currentSlug} />
        )}
        <div className={styles.buttonWrapper}>
          {demo && (
            <a href={demo} rel="noopener noreferrer" target="_blank">
              <SlidingText text={t("ui.liveDemo")} arrow />
            </a>
          )}
          {repo && (
            <a href={repo} rel="noopener noreferrer" target="_blank">
              <SlidingText text={t("ui.sourceCode")} arrow />
            </a>
          )}
        </div>
        {chapters.length > 0 && (
          <div className={styles.tocRow}>
            <div className={styles.slider}>
              <div
                className={styles.sliderFill}
                style={{ transform: `scaleY(${progress})` }}
              />
            </div>
            <ul ref={listRef} className={styles.list}>
              {chapters.map((chapter) => (
                <li
                  key={chapter.id}
                  data-active={activeId === chapter.id}
                  data-level={chapter.level}
                >
                  <a href={`#${chapter.id}`}>{chapter.title}</a>
                </li>
              ))}
            </ul>
          </div>
        )}
        {logs && logs.length > 0 && creationSlug && (
          <div className={styles.logsSection}>
            <div className={styles.logsHeading}>
              <p>Project Log</p>
              {logCategory && (
                <span className={styles.logsCategory}>{CREATION_CATEGORY_LABEL[logCategory]}</span>
              )}
            </div>
            <ul className={styles.logsList}>
              {logs.map((entry) => (
                <li key={entry.slug}>
                  <Link href={`/creations/${encodeURIComponent(creationSlug)}/log/${encodeURIComponent(entry.slug)}`}>
                    {entry.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </aside>
  )
}
