"use client"

import Link from "next/link"
import styles from "@/app/blog/page.module.css"
import { PostPreview } from "./PostPreview"
import { SlidingText } from "./SlidingText"
import { Tag } from "./Tag"
import { useT } from "./LanguageProvider"
import type { BlogMeta } from "@/lib/content"

type BlogLabel = "book-review" | "internship" | "project-log" | "contest" | "essay" | "note" | "lesson-note"

const LABEL_ORDER: BlogLabel[] = [
  "project-log",
  "internship",
  "contest",
  "book-review",
  "essay",
  "note",
  "lesson-note",
]

export const BlogListing = ({ posts }: { posts: BlogMeta[] }) => {
  const t = useT()

  const labels = [
    ...LABEL_ORDER.filter((l) => posts.some((p) => p.label === l)),
    ...[...new Set(posts.map((p) => p.label))].filter(
      (l) => !LABEL_ORDER.includes(l as BlogLabel),
    ),
  ] as BlogLabel[]

  return (
    <div className={styles.outer}>
      <div className={styles.wrapper}>
        <div className={styles.inner}>
          {labels.map((label) => (
            <section key={label} className={styles.categorySection}>
              <header className={styles.header}>
                <Tag name={t(`blog.${label}`)} />
                <Link href="/tags">
                  <SlidingText text={t("ui.allTags")} arrow />
                </Link>
              </header>
              <section className={styles.posts}>
                {posts
                  .filter((p) => p.label === label)
                  .map((p) => (
                    <PostPreview key={p.slug} type="blog" post={p} />
                  ))}
              </section>
              <div className={styles.divider} />
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
