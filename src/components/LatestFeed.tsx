import Link from "next/link"
import type { BlogMeta } from "@/lib/content"
import { formatDate } from "@/lib/format"
import styles from "./LatestFeed.module.css"

interface Props {
  posts: BlogMeta[]
}

const LABEL_EMOJI: Record<string, string> = {
  "book-review": "📖",
  "lesson-note": "📝",
  "note": "🗒",
  "essay": "✍️",
  "internship": "💼",
  "project-log": "🛠",
  "contest": "🏆",
}

export const LatestFeed = ({ posts }: Props) => (
  <div className={styles.feed}>
    <h2 className={styles.heading}>Latest</h2>
    <ul className={styles.list}>
      {posts.map((p) => (
        <li key={p.slug} className={styles.item}>
          <Link href={`/blog/${encodeURIComponent(p.slug)}`} className={styles.link}>
            <span className={styles.emoji}>{LABEL_EMOJI[p.label] ?? "·"}</span>
            <span className={styles.title}>{p.title}</span>
            <span className={styles.date}>{formatDate(p.publishedAt)}</span>
          </Link>
        </li>
      ))}
    </ul>
  </div>
)
