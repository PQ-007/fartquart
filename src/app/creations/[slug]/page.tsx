import Image from "next/image"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { MDXRemote } from "next-mdx-remote/rsc"
import styles from "./page.module.css"
import { Footer } from "@/components/Footer"
import { Tag } from "@/components/Tag"
import { Chapters, type Chapter } from "@/components/post/Chapters"
import { mdxComponents, slugify } from "@/components/post/mdx-components"
import { formatDate, getAllCreations, getCreation } from "@/lib/content"
import { coverUrl } from "@/lib/url"
import { buildPostMetadata } from "@/lib/seo"

const youtubeId = (str: string): string => {
  const match = str.match(/(?:youtu\.be\/|[?&]v=)([A-Za-z0-9_-]{11})/)
  return match ? match[1] : str
}

export const generateStaticParams = () =>
  getAllCreations().map((c) => ({ slug: c.slug }))

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> => {
  const { slug: encoded } = await params
  const slug = decodeURIComponent(encoded)
  const creation = getCreation(slug)
  if (!creation) return {}
  return buildPostMetadata(creation, "creations")
}

const extractChapters = (content: string): Chapter[] => {
  const chapters: Chapter[] = []
  let inCode = false
  for (const line of content.split("\n")) {
    if (line.trim().startsWith("```")) inCode = !inCode
    if (inCode) continue
    const match = /^##\s+(.+)$/.exec(line)
    if (match) chapters.push({ id: slugify(match[1].trim()), title: match[1].trim() })
  }
  return chapters
}

export default async function CreationPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug: encoded } = await params
  const slug = decodeURIComponent(encoded)
  const creation = getCreation(slug)
  if (!creation) notFound()

  const chapters = extractChapters(creation.content)

  return (
    <>
      <div className={styles.container}>
        <main className={styles.wrapper}>
          <article className={styles.article}>
            <header className={styles.header}>
              <div className={styles.titleRow}>
                <h1>{creation.title}</h1>
                <p>{formatDate(creation.publishedAt)}</p>
              </div>
              <div className={styles.tags}>
                {creation.tags.map((tag) => (
                  <Tag key={tag} name={tag} href={`/tags/${encodeURIComponent(tag)}`} />
                ))}
              </div>
            </header>
            <div className={styles.mediaWrapper}>
              <div className={styles.lightBorder}>
                {creation.youtube ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${youtubeId(creation.youtube)}`}
                    title={creation.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className={styles.youtube}
                  />
                ) : creation.cover ? (
                  <Image
                    src={coverUrl(creation.cover)}
                    alt={creation.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 800px"
                    className={styles.coverImage}
                    priority
                  />
                ) : (
                  <div className={styles.placeholder} />
                )}
              </div>
            </div>
            <div className="post-content">
              <MDXRemote
                source={creation.content}
                components={mdxComponents}
                options={{
                  blockJS: false,
                  blockDangerousJS: false,
                  mdxOptions: { useDynamicImport: true },
                }}
              />
            </div>
          </article>
          <Chapters chapters={chapters} demo={creation.demo} repo={creation.repo} />
        </main>
      </div>
      <Footer />
    </>
  )
}
