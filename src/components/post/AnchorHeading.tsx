"use client"

import type { ReactNode } from "react"
import styles from "./AnchorHeading.module.css"

interface Props {
  tag: "h2" | "h3"
  id: string
  children?: ReactNode
}

export const AnchorHeading = ({ tag: Tag, id, children }: Props) => (
  <Tag id={id} className={styles.heading}>
    {children}
    <a href={`#${id}`} className={styles.anchor} aria-label="Link to section" tabIndex={-1}>
      #
    </a>
  </Tag>
)
