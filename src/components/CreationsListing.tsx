"use client"

import styles from "@/app/creations/page.module.css"
import { PostPreview } from "./PostPreview"
import { useT } from "./LanguageProvider"
import type { CreationMeta } from "@/lib/content"

export const CreationsListing = ({ creations }: { creations: CreationMeta[] }) => {
  const t = useT()

  return (
    <div className={styles.outer}>
      <div className={styles.wrapper}>
        <div className={styles.inner}>
          <header className={styles.header}>
            <h1>{t("creations.heading")}</h1>
          </header>
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
