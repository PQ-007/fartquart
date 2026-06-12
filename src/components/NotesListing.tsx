"use client"

import styles from "@/app/notes/page.module.css"
import { BookCard } from "./BookCard"
import { NoteRow } from "./NoteRow"
import { Tag } from "./Tag"
import { useT } from "./LanguageProvider"
import type { BlogMeta } from "@/lib/content"

export const NotesListing = ({ posts }: { posts: BlogMeta[] }) => {
  const t = useT()

  const books = posts.filter((p) => p.label === "book-review")
  const lessonNotes = posts.filter((p) => p.label === "lesson-note")
  const notes = posts.filter((p) => p.label === "note")

  if (posts.length === 0) {
    return (
      <div className={styles.outer}>
        <div className={styles.wrapper}>
          <div className={styles.inner}>
            <h1 className={styles.heading}>{t("nav.notes")}</h1>
            <p className={styles.empty}>
              Drop `.md` files with <code>label: lesson-note</code> into{" "}
              <code>content/blog/</code>
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
          <h1 className={styles.heading}>{t("nav.notes")}</h1>

          {books.length > 0 && (
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <Tag name={t("blog.book-review")} />
                <span className={styles.count}>{books.length}</span>
              </div>
              <div className={styles.bookList}>
                {books.map((p) => (
                  <BookCard key={p.slug} post={p} />
                ))}
              </div>
            </section>
          )}

          {lessonNotes.length > 0 && (
            <>
              {books.length > 0 && <div className={styles.sectionDivider} />}
              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <Tag name={t("blog.lesson-note")} />
                  <span className={styles.count}>{lessonNotes.length}</span>
                </div>
                <div className={styles.noteList}>
                  {lessonNotes.map((p) => (
                    <NoteRow key={p.slug} post={p} />
                  ))}
                </div>
              </section>
            </>
          )}

          {notes.length > 0 && (
            <>
              {(books.length > 0 || lessonNotes.length > 0) && (
                <div className={styles.sectionDivider} />
              )}
              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <Tag name={t("blog.note")} />
                  <span className={styles.count}>{notes.length}</span>
                </div>
                <div className={styles.noteList}>
                  {notes.map((p) => (
                    <NoteRow key={p.slug} post={p} />
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
