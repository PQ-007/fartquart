"use client"

import Link from "next/link"
import styles from "@/app/tags/[tag]/page.module.css"
import { PostPreview } from "./PostPreview"
import { SlidingText } from "./SlidingText"
import { Tag } from "./Tag"
import { useT } from "./LanguageProvider"
import type { BlogMeta, CreationMeta } from "@/lib/content"

export const TagPageContent = ({
  tag,
  blogs,
  creations,
}: {
  tag: string
  blogs: BlogMeta[]
  creations: CreationMeta[]
}) => {
  const t = useT()
  const total = blogs.length + creations.length
  const itemLabel = total === 1 ? t("tag.item") : t("tag.items")

  return (
    <>
      <div className={styles.wrapper}>
        <header className={styles.header}>
          <Tag name={tag} />
          <p>
            {total} {itemLabel}
          </p>
          <Link href="/tags" className={styles.allTags}>
            <SlidingText text={t("ui.allTags")} arrow />
          </Link>
        </header>
        <section className={styles.posts}>
          {blogs.map((post) => (
            <PostPreview key={`blog:${post.slug}`} type="blog" post={post} />
          ))}
          {creations.map((c) => (
            <PostPreview key={`creation:${c.slug}`} type="creation" post={c} />
          ))}
        </section>
      </div>
    </>
  )
}
