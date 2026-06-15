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
  const [progress, setProgress] = useState(0)
  const listRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement
      const max = doc.scrollHeight - window.innerHeight
      setProgress(max > 0 ? Math.min(window.scrollY / max, 1) : 0)
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

  return (
    <aside className={styles.sidebar}>
      <div className={styles.inner}>
        <Link href={bookHref} className={styles.bookLink}>
          ↑ {bookSlug}
        </Link>

        <div className={styles.slider}>
          <div className={styles.sliderFill} style={{ transform: `scaleX(${progress})` }} />
        </div>

        {chapters.length > 0 && (
          <ul ref={listRef} className={styles.list}>
            {chapters.map((ch) => (
              <li key={ch.id} data-active={activeId === ch.id} data-level={ch.level}>
                <a href={`#${ch.id}`}>{ch.title}</a>
              </li>
            ))}
          </ul>
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
