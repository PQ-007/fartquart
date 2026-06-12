"use client"

import styles from "@/app/notes/page.module.css"
import { PostPreview } from "./PostPreview"
import { useT } from "./LanguageProvider"
import type { BlogMeta } from "@/lib/content"

export const NotesListing = ({ posts }: { posts: BlogMeta[] }) => {
  const t = useT()

  return (
    <div className={styles.outer}>
      <div className={styles.wrapper}>
        <div className={styles.inner}>
          <h1 className={styles.heading}>{t("nav.notes")}</h1>
          {posts.length === 0 ? (
            <p className={styles.empty}>
              {t("nav.notes")} — drop `.md` files with <code>label: lesson-note</code> into{" "}
              <code>content/blog/</code>
            </p>
          ) : (
            <section className={styles.grid}>
              {posts.map((p) => (
                <PostPreview key={p.slug} type="blog" post={p} />
              ))}
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
