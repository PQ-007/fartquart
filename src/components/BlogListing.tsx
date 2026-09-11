"use client"

import { useState } from "react"
import styles from "@/app/blog/page.module.css"
import { PostPreview } from "./PostPreview"
import { BookCard } from "./BookCard"
import { Carousel } from "./Carousel"
import { SlidingText } from "./SlidingText"
import { Tag } from "./Tag"
import { useT, useLanguage } from "./LanguageProvider"
import { collapseTranslations } from "@/lib/translations"
import type { BlogMeta } from "@/lib/content"

type BlogLabel = "book-review" | "internship" | "contest" | "essay" | "article"

const LABEL_ORDER: BlogLabel[] = [
  "book-review",
  "article",
  "essay",
  "internship",
  "contest",
]

export const BlogListing = ({ posts }: { posts: BlogMeta[] }) => {
  const t = useT()
  const { locale } = useLanguage()
  // Rows a reader has expanded out of the carousel into a full grid.
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const toggle = (label: string) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(label)) next.delete(label)
      else next.add(label)
      return next
    })

  const filtered = [...collapseTranslations(posts, locale)].sort(
    (a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt),
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
          {labels.map((label) => {
            // Book reviews carry cover/author/rating, so they get the portrait
            // card instead of the wide preview.
            const cards = filtered
              .filter((p) => p.label === label)
              .map((p) =>
                label === "book-review" ? (
                  <BookCard key={p.slug} post={p} />
                ) : (
                  <PostPreview key={p.slug} type="blog" post={p} />
                ),
              )
            const isOpen = expanded.has(label)
            return (
              <section key={label} className={styles.categorySection}>
                <header className={styles.header}>
                  <Tag name={t(`blog.${label}`)} />
                  {cards.length > 2 && (
                    <SlidingText
                      text={isOpen ? t("ui.showLess") : `${t("ui.seeAll")} (${cards.length})`}
                      arrow
                      onClick={() => toggle(label)}
                      expanded={isOpen}
                    />
                  )}
                </header>
                {isOpen ? (
                  <section className={styles.posts}>{cards}</section>
                ) : (
                  <Carousel label={t(`blog.${label}`)}>{cards}</Carousel>
                )}
                <div className={styles.divider} />
              </section>
            )
          })}
        </div>
      </div>
    </div>
  )
}
