"use client"

import styles from "@/app/notes/page.module.css"
import { BookCard } from "./BookCard"
import { LessonCard } from "./LessonCard"
import { Tag } from "./Tag"
import { useT } from "./LanguageProvider"
import type { BlogMeta } from "@/lib/content"

export const NotesListing = ({ posts }: { posts: BlogMeta[] }) => {
  const t = useT()

  const books = posts.filter((p) => p.label === "book-note")
  const lessons = posts.filter((p) => p.label === "lesson-note")

  if (posts.length === 0) {
    return (
      <div className={styles.outer}>
        <div className={styles.wrapper}>
          <div className={styles.inner}>
            <h1 className={styles.heading}>{t("nav.notes")}</h1>
            <p className={styles.empty}>
              Drop folders with <code>index.md</code> into the book-notes or lesson-notes directory
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.outer}>
      <div className={styles.wrapper}>
        <div className={styles.inner}>
         

          {books.length > 0 && (
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <Tag name={t("blog.book-note")} />
                <span className={styles.count}>{books.length}</span>
              </div>
              <div className={styles.bookList}>
                {books.map((p) => (
                  <BookCard key={p.slug} post={p} />
                ))}
              </div>
            </section>
          )}

          {lessons.length > 0 && (
            <>
              {books.length > 0 && <div className={styles.sectionDivider} />}
              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <Tag name={t("blog.lesson-note")} />
                  <span className={styles.count}>{lessons.length}</span>
                </div>
                <div className={styles.lessonList}>
                  {lessons.map((p) => (
                    <LessonCard key={p.slug} post={p} />
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
