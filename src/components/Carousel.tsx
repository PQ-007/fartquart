"use client"

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import styles from "./Carousel.module.css"

const Chevron = ({ dir }: { dir: "prev" | "next" }) => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d={dir === "prev" ? "m15 18-6-6 6-6" : "m9 18 6-6-6-6"} />
  </svg>
)

/**
 * Horizontal row that pages a screenful at a time, with edge arrows that fade
 * in on hover. Scrolling is native, so trackpad swipes, touch and keyboard all
 * work without extra handling; the arrows are progressive enhancement.
 */
export const Carousel = ({
  children,
  label,
}: {
  children: ReactNode
  label: string
}) => {
  const trackRef = useRef<HTMLDivElement>(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)

  const sync = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    setCanPrev(el.scrollLeft > 1)
    setCanNext(el.scrollLeft < max - 1)
  }, [])

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    // Measure on the next frame rather than in the effect body, so the first
    // paint isn't followed by a synchronous re-render.
    const id = requestAnimationFrame(sync)
    el.addEventListener("scroll", sync, { passive: true })
    const observer = new ResizeObserver(sync)
    observer.observe(el)
    return () => {
      cancelAnimationFrame(id)
      el.removeEventListener("scroll", sync)
      observer.disconnect()
    }
  }, [sync])

  const page = (dir: 1 | -1) => {
    const el = trackRef.current
    if (!el) return
    el.scrollBy({ left: dir * el.clientWidth, behavior: "smooth" })
  }

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={`${styles.arrow} ${styles.prev}`}
        onClick={() => page(-1)}
        disabled={!canPrev}
        aria-label={`Scroll ${label} backward`}
      >
        <Chevron dir="prev" />
      </button>
      <div
        ref={trackRef}
        className={styles.track}
        role="region"
        aria-label={label}
        tabIndex={0}
      >
        {children}
      </div>
      <button
        type="button"
        className={`${styles.arrow} ${styles.next}`}
        onClick={() => page(1)}
        disabled={!canNext}
        aria-label={`Scroll ${label} forward`}
      >
        <Chevron dir="next" />
      </button>
    </div>
  )
}
