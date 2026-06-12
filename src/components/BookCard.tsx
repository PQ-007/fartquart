"use client"

import Link from "next/link"
import styles from "./BookCard.module.css"
import type { BlogMeta } from "@/lib/content"

const Stars = ({ rating }: { rating: number }) => {
  const full = Math.floor(rating)
  const half = rating - full >= 0.5 ? 1 : 0
  const empty = 5 - full - half
  return (
    <div className={styles.stars}>
      {Array.from({ length: full }).map((_, i) => (
        <span key={`f${i}`} className={styles.starFull}>★</span>
      ))}
      {half ? <span className={styles.starHalf}>★</span> : null}
      {Array.from({ length: empty }).map((_, i) => (
        <span key={`e${i}`} className={styles.starEmpty}>★</span>
      ))}
      <span className={styles.ratingNum}>{rating % 1 === 0 ? rating.toFixed(0) : rating.toFixed(1)}</span>
    </div>
  )
}

export const BookCard = ({ post }: { post: BlogMeta }) => (
  <Link href={`/blog/${encodeURIComponent(post.slug)}`} className={styles.card}>
    <div className={styles.cover}>
      {post.cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.cover} alt={post.title} />
      ) : (
        <div className={styles.placeholder}>
          <span className={styles.placeholderTitle}>{post.title}</span>
          {post.author && <span className={styles.placeholderAuthor}>{post.author}</span>}
        </div>
      )}
    </div>
    <div className={styles.info}>
      <h3 className={styles.title}>{post.title}</h3>
      {post.author && <p className={styles.author}>{post.author}</p>}
      {post.rating != null && <Stars rating={post.rating} />}
    </div>
  </Link>
)
