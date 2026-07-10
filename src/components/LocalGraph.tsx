"use client"

import { TagGraph } from "./TagGraph"
import type { GraphData } from "@/lib/content"
import { useT } from "./LanguageProvider"
import styles from "./LocalGraph.module.css"

/** Obsidian-style local graph: the current page and its direct neighbors. */
export const LocalGraph = ({ data, currentId }: { data: GraphData; currentId: string }) => {
  const t = useT()
  // Nothing but the page itself — no neighborhood to show.
  if (data.nodes.length < 2) return null

  return (
    <section className={styles.outer}>
      <div className={styles.inner}>
        <h2 className={styles.heading}>
          {t("ui.localGraph")}
          <span className={styles.count}>{data.nodes.length - 1}</span>
        </h2>
        <div className={styles.frame}>
          <TagGraph data={data} hideOverlay currentId={currentId} className={styles.graph} />
        </div>
      </div>
    </section>
  )
}
