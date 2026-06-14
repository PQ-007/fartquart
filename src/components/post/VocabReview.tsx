"use client"

import { useState } from "react"
import type { NewWord } from "@/lib/content"
import { useT } from "@/components/LanguageProvider"
import sidebar from "./ChapterSidebar.module.css"
import styles from "./VocabReview.module.css"

export const VocabReview = ({ words }: { words: NewWord[] }) => {
  const t = useT()
  const [revealed, setRevealed] = useState<Set<number>>(new Set())
  const [review, setReview] = useState(false)
  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)

  const hasDefs = words.some((w) => w.definition)

  const toggle = (i: number) =>
    setRevealed((prev) => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })

  const go = (delta: number) => {
    setIdx((i) => (i + delta + words.length) % words.length)
    setFlipped(false)
  }

  return (
    <section className={sidebar.section}>
      <div className={styles.header}>
        <p className={sidebar.sectionLabel}>{t("ui.newWords")}</p>
        {hasDefs && (
          <button
            type="button"
            className={styles.reviewToggle}
            onClick={() => {
              setReview((r) => !r)
              setIdx(0)
              setFlipped(false)
            }}
            data-active={review}
          >
            {t("ui.review")}
          </button>
        )}
      </div>

      {review ? (
        <div className={styles.card}>
          <button
            type="button"
            className={styles.flip}
            onClick={() => setFlipped((f) => !f)}
          >
            <span className={styles.cardWord}>{words[idx].word}</span>
            {flipped && words[idx].definition && (
              <span className={styles.cardDef}>{words[idx].definition}</span>
            )}
            {!flipped && words[idx].definition && (
              <span className={styles.cardHint}>{t("ui.reveal")}</span>
            )}
          </button>
          <div className={styles.nav}>
            <button type="button" onClick={() => go(-1)} aria-label="Previous">←</button>
            <span className={styles.counter}>
              {idx + 1} / {words.length}
            </span>
            <button type="button" onClick={() => go(1)} aria-label="Next">→</button>
          </div>
        </div>
      ) : (
        <ul className={sidebar.wordList}>
          {words.map((w, i) => (
            <li key={w.word}>
              {w.definition ? (
                <button
                  type="button"
                  className={styles.wordRow}
                  onClick={() => toggle(i)}
                  data-open={revealed.has(i)}
                >
                  <span className={sidebar.word}>{w.word}</span>
                  {revealed.has(i) && (
                    <span className={sidebar.definition}>{w.definition}</span>
                  )}
                </button>
              ) : (
                <span className={sidebar.word}>{w.word}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
