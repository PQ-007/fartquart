"use client"

import Link from "next/link"
import styles from "@/app/blog/page.module.css"
import { PostPreview } from "./PostPreview"
import { SlidingText } from "./SlidingText"
import { Tag } from "./Tag"
import { useT, useLanguage } from "./LanguageProvider"
import { collapseTranslations } from "@/lib/translations"
import type { BlogMeta } from "@/lib/content"

type BlogLabel = "book-review" | "internship" | "project-log" | "contest" | "essay" | "article"

const LABEL_ORDER: BlogLabel[] = [
  "article",
  "essay",
  "project-log",
  "internship",
  "contest",
]

export const BlogListing = ({ posts }: { posts: BlogMeta[] }) => {
  const t = useT()
  const { locale } = useLanguage()

  const filtered = collapseTranslations(posts, locale).filter(
    (p) => p.label !== "book-review",
  )

  const labels = [
    ...LABEL_ORDER.filter((l) => filtered.some((p) => p.label === l)),
    ...[...new Set(filtered.map((p) => p.label))].filter(
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
                {filtered
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
