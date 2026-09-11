import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { MDXRemote } from "next-mdx-remote/rsc"
import styles from "./page.module.css"
import { Footer } from "@/components/Footer"
import { mdxComponents } from "@/components/post/mdx-components"
import { extractChapters } from "@/lib/toc"
import { ChapterSidebar } from "@/components/post/ChapterSidebar"
import { MusicPlayer } from "@/components/MusicPlayer"
import { getAllCreations, getBacklinks, getCreation, getLocalGraph, getProjectLogChapter, getProjectLogChapters, vaultNodeId } from "@/lib/content"
import { Backlinks } from "@/components/Backlinks"
import { VideoPlayer } from "@/components/VideoPlayer"
import { LocalGraph } from "@/components/LocalGraph"
import { mdxOptions, sanitizeMdx } from "@/lib/mdx-options"
import { absoluteUrl, SITE_NAME, DEFAULT_OG_IMAGE } from "@/lib/site"
import { coverUrl, isGif } from "@/lib/url"

const extractLinks = (content: string) => {
  const links: { text: string; url: string }[] = []
  const re = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g
  let m
  while ((m = re.exec(content)) !== null) {
    links.push({ text: m[1], url: m[2] })
  }
  return links
}

export const generateStaticParams = async () =>
  getAllCreations().flatMap((c) =>
    getProjectLogChapters(c.slug).map((ch) => ({
      slug: c.slug,
      chapter: ch.slug,
    }))
  )

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ slug: string; chapter: string }>
}): Promise<Metadata> => {
  const { slug, chapter } = await params
  const creationSlug = decodeURIComponent(slug)
  const post = getProjectLogChapter(creationSlug, decodeURIComponent(chapter))
  if (!post) return {}
  const url = absoluteUrl(`/creations/${encodeURIComponent(creationSlug)}/log/${encodeURIComponent(post.slug)}`)
  return {
    title: post.title,
    description: post.description || `${post.title} — ${creationSlug}`,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url,
      siteName: SITE_NAME,
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [DEFAULT_OG_IMAGE],
    },
  }
}

export default async function ProjectLogChapterPage({
  params,
}: {
  params: Promise<{ slug: string; chapter: string }>
}) {
  const { slug: rawSlug, chapter: rawChapter } = await params
  const creationSlug = decodeURIComponent(rawSlug)
  const chapterSlug = decodeURIComponent(rawChapter)

  const post = getProjectLogChapter(creationSlug, chapterSlug)
  if (!post) notFound()
  const creation = getCreation(creationSlug)
  if (!creation) notFound()

  const allChapters = getProjectLogChapters(creationSlug)
  const currentIdx = allChapters.findIndex((c) => c.slug === chapterSlug)
  const prev = currentIdx > 0 ? allChapters[currentIdx - 1] : null
  const next = currentIdx < allChapters.length - 1 ? allChapters[currentIdx + 1] : null
  const tocChapters = extractChapters(post.content)
  const sources = extractLinks(post.content)
  const creationHref = `/creations/${encodeURIComponent(creationSlug)}`

  return (
    <>
      {post.music && <MusicPlayer src={post.music} />}
      <div className={styles.container}>
        <main className={styles.wrapper}>
          <article className={styles.article}>
            <header className={styles.header}>
              <div className={styles.titleRow}>
                <h1>{post.title}</h1>
              </div>
            </header>
            {post.cover && (
              <div className={styles.cover}>
                {post.coverVideo ? (
                  <VideoPlayer
                    src={coverUrl(post.coverVideo)}
                    poster={coverUrl(post.cover)}
                  />
                ) : (
                  <Image
                    src={coverUrl(post.cover)}
                    alt={post.title}
                    fill
                    sizes="(max-width: 900px) 100vw, 800px"
                    style={{ objectFit: "cover" }}
                    priority
                    unoptimized={isGif(post.cover)}
                  />
                )}
              </div>
            )}
            {tocChapters.length > 0 && (
              <details className={styles.mobileToc}>
                <summary className={styles.mobileTocSummary}>
                  Contents ({tocChapters.length})
                </summary>
                <ul className={styles.mobileTocList}>
                  {tocChapters.map((c) => (
                    <li key={c.id} data-level={c.level}>
                      <a href={`#${c.id}`}>{c.title}</a>
                    </li>
                  ))}
                </ul>
              </details>
            )}
            <div className="post-content">
              <MDXRemote
                source={sanitizeMdx(post.content)}
                components={mdxComponents}
                options={mdxOptions}
              />
            </div>
            <nav className={styles.chapterNav}>
              {prev ? (
                <Link
                  href={`/creations/${encodeURIComponent(creationSlug)}/log/${encodeURIComponent(prev.slug)}`}
                  className={styles.navLink}
                >
                  <span className={styles.navHint}>Previous</span>
                  <span className={styles.navTitle}>← {prev.title}</span>
                </Link>
              ) : (
                <span className={styles.navLink} />
              )}
              {next ? (
                <Link
                  href={`/creations/${encodeURIComponent(creationSlug)}/log/${encodeURIComponent(next.slug)}`}
                  className={`${styles.navLink} ${styles.navLinkNext}`}
                >
                  <span className={styles.navHint}>Next</span>
                  <span className={styles.navTitle}>{next.title} →</span>
                </Link>
              ) : (
                <span className={`${styles.navLink} ${styles.navLinkNext}`} />
              )}
            </nav>
          </article>
          <ChapterSidebar
            bookSlug={creation.title}
            bookHref={creationHref}
            chapters={tocChapters}
            sources={sources.length > 0 ? sources : undefined}
          />
        </main>
      </div>
      <LocalGraph
        data={getLocalGraph(vaultNodeId.chapter(creationSlug, chapterSlug))}
        currentId={vaultNodeId.chapter(creationSlug, chapterSlug)}
      />
      <Backlinks items={getBacklinks(chapterSlug)} />
      <Footer />
    </>
  )
}
