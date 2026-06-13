"use client"

import Link from "next/link"
import styles from "./BookCard.module.css"
import type { BlogMeta } from "@/lib/content"

const SPINE_BG = ["#0f1f3d", "#1e0f3d", "#0f2d1e", "#2d1a00", "#2d0f0f", "#1a0f2d"]

const spineColor = (title: string) =>
  SPINE_BG[[...title].reduce((a, c) => a + c.charCodeAt(0), 0) % SPINE_BG.length]

const coverUrl = (cover: string) => cover.startsWith("http") ? cover : `/${cover}`

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
      <span className={styles.ratingNum}>
        {rating % 1 === 0 ? rating.toFixed(0) : rating.toFixed(1)}
      </span>
    </div>
  )
}

export const BookCard = ({ post }: { post: BlogMeta }) => {
  const href =
    post.label === "book-note"
      ? `/notes/${encodeURIComponent(post.slug)}`
      : `/blog/${encodeURIComponent(post.slug)}`
  return (
  <Link href={href} className={styles.card}>
    <div className={styles.cover}>
      {post.cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={coverUrl(post.cover)} alt={post.title} />
      ) : (
        <div className={styles.spine} style={{ background: spineColor(post.title) }}>
          <span className={styles.spineTitle}>{post.title}</span>
          {post.author && <span className={styles.spineAuthor}>{post.author}</span>}
        </div>
      )}
    </div>
    <div className={styles.info}>
      <h3 className={styles.title}>{post.title}</h3>
      {post.author && <p className={styles.author}>{post.author}</p>}
      {post.rating != null && <Stars rating={post.rating} />}
      {(post.genre || post.pages) && (
        <div className={styles.bookMeta}>
          {post.genre && <span className={styles.genre}>{post.genre}</span>}
          {post.pages && <span className={styles.pages}>{post.pages}p</span>}
        </div>
      )}
      {post.description && <p className={styles.description}>{post.description}</p>}
    </div>
  </Link>
  )
}
