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
  const [marker, setMarker] = useState<{ top: number; height: number } | null>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const railRef = useRef<HTMLDivElement>(null)
  const t = useT()

  useEffect(() => {
    const onScroll = () => {
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

  // The rail marks where the active entry sits in the list. Deriving it from
  // page scroll instead would drift away from that entry on any page whose
  // sections aren't all the same length.
  useEffect(() => {
    const measure = () => {
      const list = listRef.current
      const rail = railRef.current
      const index = chapters.findIndex((c) => c.id === activeId)
      if (!list || !rail || index < 0) return setMarker(null)
      const li = list.children[index] as HTMLElement | undefined
      if (!li) return setMarker(null)
      const a = li.getBoundingClientRect()
      const b = rail.getBoundingClientRect()
      setMarker({ top: a.top - b.top, height: a.height })
    }
    measure()
    window.addEventListener("resize", measure)
    return () => window.removeEventListener("resize", measure)
  }, [activeId, chapters])

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
            <div className={styles.slider} ref={railRef}>
              <div
                className={styles.sliderFill}
                style={marker ? { top: marker.top, height: marker.height } : { height: 0 }}
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
