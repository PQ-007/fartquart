"use client"

import { useMemo, useState } from "react"
import styles from "@/app/creations/page.module.css"
import { PostPreview } from "./PostPreview"
import { useT } from "./LanguageProvider"
import type { CreationMeta } from "@/lib/content"
import { CREATION_CATEGORY_LABEL, CREATION_CATEGORY_ORDER } from "@/lib/categories"

export const CreationsListing = ({ creations }: { creations: CreationMeta[] }) => {
  const t = useT()
  const [filter, setFilter] = useState<string>("all")

  const categories = useMemo(
    () => CREATION_CATEGORY_ORDER.filter((cat) => creations.some((c) => c.category === cat)),
    [creations],
  )

  const shown = filter === "all" ? creations : creations.filter((c) => c.category === filter)

  if (categories.length === 0) {
    return (
      <div className={styles.outer}>
        <div className={styles.wrapper}>
          <div className={styles.inner}>
            <section className={styles.grid}>
              {creations.map((c) => (
                <PostPreview key={c.slug} type="creation" post={c} />
              ))}
            </section>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.outer}>
      <div className={styles.wrapper}>
        <div className={styles.inner}>
          <div className={styles.filterBar}>
            <button
              type="button"
              className={styles.filterButton}
              data-active={filter === "all"}
              onClick={() => setFilter("all")}
            >
              {t("ui.all")}
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={styles.filterButton}
                data-active={filter === cat}
                onClick={() => setFilter(cat)}
              >
                {CREATION_CATEGORY_LABEL[cat]}
              </button>
            ))}
          </div>
          <section className={styles.grid}>
            {shown.map((c) => (
              <PostPreview key={c.slug} type="creation" post={c} />
            ))}
          </section>
        </div>
      </div>
    </div>
  )
}
