import Image from "next/image"
import Link from "next/link"
import type { BlogMeta } from "@/lib/content"
import { formatDate } from "@/lib/format"
import { Tag } from "@/components/Tag"
import styles from "./ActivityFeed.module.css"

interface Props {
  posts: BlogMeta[]
}

const NOTE_LABELS = ["note", "lesson-note", "book-note"]

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

export const ActivityFeed = ({ posts }: Props) => (
  <div className={styles.feed}>
    <h2 className={styles.heading}>Latest</h2>
    <div className={styles.grid}>
      {posts.map((post) => {
        const href = NOTE_LABELS.includes(post.label)
          ? `/notes/${encodeURIComponent(post.slug)}`
          : `/blog/${encodeURIComponent(post.slug)}`
        return (
          <Link key={post.slug} href={href} className={styles.card}>
            <div className={styles.cover}>
              {post.cover ? (
                <Image
                  src={post.cover}
                  alt={post.title}
                  fill
                  sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 33vw"
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <div
                  className={styles.placeholder}
                  style={{ background: gradientFor(post.slug) }}
                >
                  <span className={styles.placeholderLabel}>{post.label.replace("-", " ")}</span>
                  <span className={styles.placeholderTitle}>{post.title}</span>
                </div>
              )}
            </div>
            <div className={styles.info}>
              <Tag name={post.label} />
              <p className={styles.title}>{post.title}</p>
              <p className={styles.date}>{formatDate(post.publishedAt)}</p>
            </div>
          </Link>
        )
      })}
    </div>
  </div>
)
