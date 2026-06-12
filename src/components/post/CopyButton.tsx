"use client"

import { useState } from "react"
import styles from "./CodeSnippet.module.css"
import { CheckIcon, CopyIcon } from "../icons"

export const CopyButton = ({ code }: { code: string }) => {
  const [copied, setCopied] = useState(false)

  return (
    <button
      className={styles.copyButton}
      aria-label="Copy code"
      onClick={() => {
        navigator.clipboard.writeText(code)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }}
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
    </button>
  )
}
