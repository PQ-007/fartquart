"use client"

import styles from "./CreationLinks.module.css"
import { SlidingText } from "../SlidingText"
import { useT } from "../LanguageProvider"

/** Always-visible demo/repo links — kept out of the `Chapters` sidebar, which
 *  hides below 1200px and would otherwise take these links with it. */
export const CreationLinks = ({ demo, repo }: { demo?: string; repo?: string }) => {
  const t = useT()
  if (!demo && !repo) return null
  return (
    <div className={styles.links}>
      {demo && (
        <a href={demo} rel="noopener noreferrer" target="_blank">
          <SlidingText text={t("ui.liveDemo")} arrow />
        </a>
      )}
      {repo && (
        <a href={repo} rel="noopener noreferrer" target="_blank">
          <SlidingText text={t("ui.sourceCode")} arrow />
        </a>
      )}
    </div>
  )
}
