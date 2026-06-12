"use client"

import { useState, type ReactNode } from "react"
import styles from "./PageVeil.module.css"

/**
 * Route transition: a background-colored veil with a glowing accent edge
 * sweeps upward to reveal each page. Mounted fresh on every navigation
 * (via app/template.tsx), it covers the frame where the next route's CSS
 * is still loading, so the browser never flashes unstyled content.
 *
 * The page itself is rendered untouched — no transform/opacity wrappers —
 * because the home hero relies on `position: fixed` + `mix-blend-mode`,
 * which animated ancestors would break.
 */
export const PageVeil = ({ children }: { children: ReactNode }) => {
  const [done, setDone] = useState(false)

  return (
    <>
      {children}
      {!done && (
        <div
          className={styles.veil}
          aria-hidden="true"
          onAnimationEnd={(e) => {
            if (e.target === e.currentTarget) setDone(true)
          }}
        >
          <div className={styles.edge} />
        </div>
      )}
    </>
  )
}
