"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import styles from "./ChapterSidebar.module.css"
import type { Chapter } from "./Chapters"
import type { NewWord } from "@/lib/content"
import { VocabReview } from "./VocabReview"

interface Source {
  text: string
  url: string
}

interface Props {
  bookSlug: string
  bookHref: string
  chapters: Chapter[]
  newWords?: NewWord[]
  sources?: Source[]
}

export const ChapterSidebar = ({ bookSlug, bookHref, chapters, newWords, sources }: Props) => {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [marker, setMarker] = useState<{ top: number; height: number } | null>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const railRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => {
      let current: string | null = null
      for (const ch of chapters) {
        const el = document.getElementById(ch.id)
        if (el && el.getBoundingClientRect().top < 150) current = ch.id
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
    <aside className={styles.sidebar}>
      <div className={styles.inner}>
        <Link href={bookHref} className={styles.bookLink}>
          ↑ {bookSlug}
        </Link>

        {chapters.length > 0 && (
          <div className={styles.tocRow}>
            <div className={styles.slider} ref={railRef}>
              <div
                className={styles.sliderFill}
                style={marker ? { top: marker.top, height: marker.height } : { height: 0 }}
              />
            </div>
            <ul ref={listRef} className={styles.list}>
              {chapters.map((ch) => (
                <li key={ch.id} data-active={activeId === ch.id} data-level={ch.level}>
                  <a href={`#${ch.id}`}>{ch.title}</a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {newWords && newWords.length > 0 && <VocabReview words={newWords} />}

        {sources && sources.length > 0 && (
          <section className={styles.section}>
            <p className={styles.sectionLabel}>Sources</p>
            <ul className={styles.sourceList}>
              {sources.map((s) => (
                <li key={s.url}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer">
                    {s.text}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </aside>
  )
}
