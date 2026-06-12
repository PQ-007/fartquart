"use client"

import styles from "@/app/notes/page.module.css"
import { PostPreview } from "./PostPreview"
import { BookCard } from "./BookCard"
import { Tag } from "./Tag"
import { useT } from "./LanguageProvider"
import type { BlogMeta } from "@/lib/content"

export const NotesListing = ({ posts }: { posts: BlogMeta[] }) => {
  const t = useT()

  const books = posts.filter((p) => p.label === "book-review")
  const notes = posts.filter((p) => p.label !== "book-review")

  return (
    <div className={styles.outer}>
      <div className={styles.wrapper}>
        <div className={styles.inner}>
          <h1 className={styles.heading}>{t("nav.notes")}</h1>

          {books.length > 0 && (
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <Tag name={t("blog.book-review")} />
              </div>
              <div className={styles.bookList}>
                {books.map((p) => (
                  <BookCard key={p.slug} post={p} />
                ))}
              </div>
            </section>
          )}

          {notes.length > 0 && (
            <section className={styles.section}>
              <div className={styles.grid}>
                {notes.map((p) => (
                  <PostPreview key={p.slug} type="blog" post={p} />
                ))}
              </div>
            </section>
          )}

          {posts.length === 0 && (
            <p className={styles.empty}>
              {t("nav.notes")} — drop `.md` files with <code>label: lesson-note</code> into{" "}
              <code>content/blog/</code>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
