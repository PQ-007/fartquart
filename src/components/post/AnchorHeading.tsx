"use client"

import { useState, type ReactNode } from "react"
import styles from "./AnchorHeading.module.css"

interface Props {
  tag: "h2" | "h3"
  id: string
  children?: ReactNode
}

export const AnchorHeading = ({ tag: Tag, id, children }: Props) => {
  const [copied, setCopied] = useState(false)

  const copyLink = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Let no-JS / middle-click fall back to the plain hash navigation.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    const url = `${location.origin}${location.pathname}#${id}`
    history.replaceState(null, "", `#${id}`)
    navigator.clipboard?.writeText(url).then(
      () => {
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      },
      () => {},
    )
  }

  return (
    <Tag id={id} className={styles.heading}>
      {children}
      <a
        href={`#${id}`}
        className={styles.anchor}
        aria-label="Copy link to section"
        tabIndex={-1}
        onClick={copyLink}
      >
        {copied ? "✓" : "#"}
      </a>
    </Tag>
  )
}
