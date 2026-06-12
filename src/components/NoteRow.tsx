"use client"

import Link from "next/link"
import styles from "./NoteRow.module.css"
import { Tag } from "./Tag"
import { formatDate } from "@/lib/format"
import type { BlogMeta } from "@/lib/content"

export const NoteRow = ({ post }: { post: BlogMeta }) => (
  <Link href={`/blog/${encodeURIComponent(post.slug)}`} className={styles.row}>
    <div className={styles.top}>
      <span className={styles.title}>{post.title}</span>
      <span className={styles.meta}>
        {formatDate(post.publishedAt)}
        {post.readTime ? ` · ${post.readTime} min` : ""}
      </span>
    </div>
    {post.tags.length > 0 && (
      <div className={styles.tags}>
        {post.tags.map((t) => (
          <Tag key={t} name={t} href={`/tags/${encodeURIComponent(t)}`} />
        ))}
      </div>
    )}
  </Link>
)
