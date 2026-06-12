"use client"

import { useEffect, useState, useCallback } from "react"
import styles from "./PostImageLightbox.module.css"

export const PostImageLightbox = () => {
  const [active, setActive] = useState<{ src: string; alt: string } | null>(null)

  const close = useCallback(() => setActive(null), [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === "IMG" && target.closest(".post-content")) {
        const img = target as HTMLImageElement
        setActive({ src: img.src, alt: img.alt })
      }
    }
    document.addEventListener("click", handler)
    return () => document.removeEventListener("click", handler)
  }, [])

  useEffect(() => {
    if (!active) return
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") close() }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [active, close])

  if (!active) return null

  return (
    <div className={styles.overlay} onClick={close}>
      <button className={styles.close} onClick={close} aria-label="Close">✕</button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={active.src}
        alt={active.alt}
        className={styles.image}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  )
}
