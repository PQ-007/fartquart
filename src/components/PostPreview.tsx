"use client"

import Image from "next/image"
import Link from "next/link"
import styles from "./PostPreview.module.css"
import { SlidingText } from "./SlidingText"
import { VideoPlayer } from "./VideoPlayer"
import { useT } from "./LanguageProvider"
import type { PostMeta } from "@/lib/posts"
import type { BlogMeta, CreationMeta } from "@/lib/content"
import { formatDate } from "@/lib/format"

const CDN = "https://d4frua9bq45mo.cloudfront.net"
const videoUrl = (mainVideo: string) => `${CDN}/${mainVideo}.mp4`

const youtubeId = (str: string): string => {
  const match = str.match(/(?:youtu\.be\/|[?&]v=)([A-Za-z0-9_-]{11})/)
  return match ? match[1] : str
}

type PostPreviewProps =
  | { type?: "post"; post: PostMeta }
  | { type: "blog"; post: BlogMeta }
  | { type: "creation"; post: CreationMeta }

const MediaSlot = ({
  mainVideo,
  cover,
  youtube,
  href,
  label,
  viewText,
}: {
  mainVideo?: string
  cover?: string
  youtube?: string
  href: string
  label: string
  viewText: string
}) => {
  const ytThumb = youtube
    ? `https://img.youtube.com/vi/${youtubeId(youtube)}/maxresdefault.jpg`
    : undefined
  return (
    <div className={styles.videoWrapper}>
      <div className={styles.lightBorder}>
        <Link href={href} className={styles.videoLink}>
          {mainVideo ? (
            <VideoPlayer src={videoUrl(mainVideo)} />
          ) : cover ? (
            <Image
              src={cover}
              alt={label}
              fill
              sizes="(max-width: 900px) 100vw, 50vw"
              className={styles.coverImage}
            />
          ) : ytThumb ? (
            <Image
              src={ytThumb}
              alt={label}
              fill
              sizes="(max-width: 900px) 100vw, 50vw"
              className={styles.coverImage}
              unoptimized
            />
          ) : (
            <div className={styles.placeholder} />
          )}
          <section className={styles.overlay}>
            <h3>{viewText}</h3>
          </section>
        </Link>
      </div>
    </div>
  )
}

export const PostPreview = ({ type = "post", post }: PostPreviewProps) => {
  const t = useT()

  if (type === "blog") {
    const blog = post as BlogMeta
    return (
      <div className={styles.container}>
        <MediaSlot
          cover={blog.cover}
          href={`/blog/${blog.slug}`}
          label={blog.title}
          viewText={t("ui.view")}
        />
        <div className={styles.inner}>
          <div>
            <h1>{blog.title}</h1>
            <p className={styles.description}>{blog.description}</p>
          </div>
          <div className={styles.footer}>
            <p className={styles.date}>{formatDate(blog.publishedAt)}</p>
            <Link className={styles.link} href={`/blog/${blog.slug}`}>
              <SlidingText text={t("ui.readPost")} arrow />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (type === "creation") {
    const creation = post as CreationMeta
    return (
      <div className={styles.container}>
        <MediaSlot
          cover={creation.cover}
          youtube={creation.youtube}
          href={`/creations/${creation.slug}`}
          label={creation.title}
          viewText={t("ui.view")}
        />
        <div className={styles.inner}>
          <div>
            <h1>{creation.title}</h1>
            <p className={styles.description}>{creation.description}</p>
          </div>
          <Link className={styles.link} href={`/creations/${creation.slug}`}>
            <SlidingText text={t("ui.viewCreation")} arrow />
          </Link>
        </div>
      </div>
    )
  }

  const p = post as PostMeta
  return (
    <div className={styles.container}>
      <MediaSlot
        mainVideo={p.mainVideo}
        href={`/posts/${p.slug}`}
        label={p.title}
        viewText={t("ui.view")}
      />
      <div className={styles.inner}>
        <div>
          <h1>{p.title}</h1>
          <p className={styles.description}>{p.description}</p>
        </div>
        <Link className={styles.link} href={`/posts/${p.slug}`}>
          <SlidingText text={t("ui.continueReading")} arrow />
        </Link>
      </div>
    </div>
  )
}
