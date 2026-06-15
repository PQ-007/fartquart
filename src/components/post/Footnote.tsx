"use client"

import { useState, type ReactNode } from "react"
import styles from "./Footnote.module.css"

export const Footnote = ({ id, children }: { id?: string; children?: ReactNode }) => {
  const [open, setOpen] = useState(false)

  return (
    <span className={styles.footnote}>
      <button
        type="button"
        className={styles.marker}
        aria-label={`Footnote ${id ?? ""}`}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setOpen(false)}
      >
        {id}
      </button>
      <span className={styles.popover} data-open={open} role="note">
        {children}
      </span>
    </span>
  )
}
