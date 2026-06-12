"use client"

import { useEffect, useRef, useState } from "react"
import styles from "./Chapters.module.css"
import { SlidingText } from "../SlidingText"

export type Chapter = { id: string; title: string }

export const Chapters = ({
  chapters,
  demo,
  repo,
}: {
  chapters: Chapter[]
  demo?: string
  repo?: string
}) => {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const listRef = useRef<HTMLUListElement>(null)

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
        <div className={styles.buttonWrapper}>
          {demo && (
            <a href={demo} rel="noopener noreferrer" target="_blank">
              <SlidingText text="Live Demo" arrow />
            </a>
          )}
          {repo && (
            <a href={repo} rel="noopener noreferrer" target="_blank">
              <SlidingText text="Source Code" arrow />
            </a>
          )}
        </div>
        <div className={styles.slider}>
          <div
            className={styles.sliderFill}
            style={{ transform: `scaleX(${progress})` }}
          />
        </div>
        <ul ref={listRef} className={styles.list}>
          {chapters.map((chapter) => (
            <li key={chapter.id} data-active={activeId === chapter.id}>
              <a href={`#${chapter.id}`}>{chapter.title}</a>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}
