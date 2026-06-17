"use client"

import Image from "next/image"
import Link from "next/link"
import type { BlogMeta } from "@/lib/content"
import { formatDate } from "@/lib/format"
import { coverUrl, isGif, postPath } from "@/lib/url"
import { Tag } from "@/components/Tag"
import { useT, useLanguage } from "@/components/LanguageProvider"
import { collapseTranslations } from "@/lib/translations"
import card from "./ActivityFeed.module.css"
import styles from "./RelatedPosts.module.css"

const GRADIENTS = [
  "linear-gradient(135deg, #0f1f3d, #1e3a5f)",
  "linear-gradient(135deg, #1e0f3d, #3d1a6e)",
  "linear-gradient(135deg, #0f2d1e, #1a5c3a)",
  "linear-gradient(135deg, #2d1a00, #5c3a00)",
  "linear-gradient(135deg, #2d0f0f, #5c1a1a)",
  "linear-gradient(135deg, #1a1a2d, #2d2d5c)",
]
const gradientFor = (slug: string) =>
  GRADIENTS[[...slug].reduce((a, c) => a + c.charCodeAt(0), 0) % GRADIENTS.length]

export const RelatedPosts = ({ posts }: { posts: BlogMeta[] }) => {
  const t = useT()
  const { locale } = useLanguage()
  if (posts.length === 0) return null
  const shown = collapseTranslations(posts, locale)

  return (
    <section className={styles.outer}>
      <div className={styles.inner}>
        <h2 className={card.heading}>{t("ui.related")}</h2>
        <div className={card.grid}>
          {shown.map((post) => (
            <Link key={post.slug} href={postPath(post.slug, post.label)} className={card.card}>
              <div className={card.cover}>
                {post.cover ? (
                  <Image
                    src={coverUrl(post.cover)}
                    alt={post.title}
                    fill
                    sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 33vw"
                    style={{ objectFit: "cover" }}
                    unoptimized={isGif(post.cover)}
                  />
                ) : (
                  <div
                    className={card.placeholder}
                    style={{ background: gradientFor(post.slug) }}
                  >
                    <span className={card.placeholderLabel}>{post.label.replace("-", " ")}</span>
                    <span className={card.placeholderTitle}>{post.title}</span>
                  </div>
                )}
              </div>
              <div className={card.info}>
                <Tag name={post.label} />
                <p className={card.title}>{post.title}</p>
                <p className={card.date}>{formatDate(post.publishedAt)}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
