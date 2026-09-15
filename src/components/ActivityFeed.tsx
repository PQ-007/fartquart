import Image from "next/image"
import Link from "next/link"
import type { BlogMeta } from "@/lib/content"
import { formatDate } from "@/lib/format"
import { Tag } from "@/components/Tag"
import { coverUrl, isGif, postPath } from "@/lib/url"
import styles from "./ActivityFeed.module.css"
import { VideoPlayer } from "./VideoPlayer"

interface Props {
  posts: BlogMeta[]
  /** Held above the latest list in its own section. */
  pinned?: BlogMeta
}

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

const Card = ({ post }: { post: BlogMeta }) => (
  <Link href={postPath(post.slug, post.label)} className={styles.card}>
    <div className={styles.cover}>
      {post.coverVideo ? (
        <VideoPlayer
          src={coverUrl(post.coverVideo)}
          poster={post.cover ? coverUrl(post.cover) : undefined}
        />
      ) : post.cover ? (
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
          className={styles.placeholder}
          style={{ background: gradientFor(post.slug) }}
        >
          <span className={styles.placeholderLabel}>{post.label.replace("-", " ")}</span>
          <span className={styles.placeholderTitle}>{post.title}</span>
        </div>
      )}
    </div>
    <div className={styles.info}>
      <p className={styles.title}>{post.title}</p>
      <div className={styles.meta}>
        <Tag name={post.label} />
        <p className={styles.date}>{formatDate(post.publishedAt)}</p>
      </div>
    </div>
  </Link>
)

export const ActivityFeed = ({ posts, pinned }: Props) => (
  <div className={styles.feed}>
    {pinned && (
      <section className={styles.pinned}>
        <h2 className={styles.heading}>Pinned</h2>
        <div className={styles.grid}>
          <Card post={pinned} />
        </div>
      </section>
    )}
    <h2 className={styles.heading}>Latest</h2>
    <div className={styles.grid}>
      {posts.map((post) => (
        <Card key={post.slug} post={post} />
      ))}
    </div>
  </div>
)
