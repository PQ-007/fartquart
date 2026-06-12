"use client"

import { useState } from "react"
import { SlidingText } from "./SlidingText"
import styles from "./Footer.module.css"

export const CopyEmail = ({ email }: { email: string }) => {
  const [copied, setCopied] = useState(false)

  return (
    <div
      className={styles.copy}
      onClick={() => {
        navigator.clipboard.writeText(email)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }}
    >
      <SlidingText text={email} />
      <span className={styles.copied} data-visible={copied}>
        Copied!
      </span>
    </div>
  )
}
