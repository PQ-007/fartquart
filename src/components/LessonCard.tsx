"use client"

import Image from "next/image"
import Link from "next/link"
import styles from "./LessonCard.module.css"
import { coverUrl, isGif } from "@/lib/url"
import type { BlogMeta } from "@/lib/content"

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

export const LessonCard = ({ post }: { post: BlogMeta }) => {
  const href = `/notes/${encodeURIComponent(post.slug)}`

  return (
    <Link href={href} className={styles.card}>
      <div className={styles.cover}>
        {post.cover ? (
          <Image
            src={coverUrl(post.cover)}
            alt={post.title}
            fill
            sizes="(max-width: 700px) 100vw, 50vw"
            style={{ objectFit: "cover" }}
            unoptimized={isGif(post.cover)}
          />
        ) : (
          <div className={styles.placeholder} style={{ background: gradientFor(post.slug) }}>
            <span className={styles.placeholderLabel}>{post.title}</span>
          </div>
        )}
      </div>
      <div className={styles.info}>
        <h3 className={styles.title}>{post.title}</h3>
        {post.description && <p className={styles.description}>{post.description}</p>}
      </div>
    </Link>
  )
}
