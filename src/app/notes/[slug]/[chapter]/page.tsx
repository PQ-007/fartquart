import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { MDXRemote } from "next-mdx-remote/rsc"
import styles from "./page.module.css"
import { Footer } from "@/components/Footer"
import { mdxComponents, slugify } from "@/components/post/mdx-components"
import type { Chapter } from "@/components/post/Chapters"
import { ReadingProgress } from "@/components/ReadingProgress"
import { ChapterSidebar } from "@/components/post/ChapterSidebar"
import { getAllBlogPosts, getBookChapter, getBookNoteChapters } from "@/lib/content"
import { mdxOptions, sanitizeMdx } from "@/lib/mdx-options"

const extractLinks = (content: string) => {
  const links: { text: string; url: string }[] = []
  const re = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g
  let m
  while ((m = re.exec(content)) !== null) {
    links.push({ text: m[1], url: m[2] })
  }
  return links
}

export const generateStaticParams = async () => {
  const bookNotes = getAllBlogPosts().filter((p) => p.label === "book-note" || p.label === "lesson-note")
  return bookNotes.flatMap((book) =>
    getBookNoteChapters(book.slug).map((ch) => ({
      slug: book.slug,
      chapter: ch.slug,
    }))
  )
}

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ slug: string; chapter: string }>
}): Promise<Metadata> => {
  const { slug, chapter } = await params
  const post = getBookChapter(decodeURIComponent(slug), decodeURIComponent(chapter))
  if (!post) return {}
  return { title: post.title }
}

const extractChapters = (content: string): Chapter[] => {
  const chapters: Chapter[] = []
  const seen = new Map<string, number>()
  let inCode = false
  for (const line of content.split("\n")) {
    if (line.trim().startsWith("```")) inCode = !inCode
    if (inCode) continue
    const match = /^##\s+(.+)$/.exec(line)
    if (!match) continue
    const title = match[1].trim()
    const base = slugify(title)
    const count = seen.get(base) ?? 0
    seen.set(base, count + 1)
    const id = count === 0 ? base : `${base}-${count}`
    chapters.push({ id, title })
  }
  return chapters
}

export default async function BookChapterPage({
  params,
}: {
  params: Promise<{ slug: string; chapter: string }>
}) {
  const { slug: rawSlug, chapter: rawChapter } = await params
  const bookSlug = decodeURIComponent(rawSlug)
  const chapterSlug = decodeURIComponent(rawChapter)

  const post = getBookChapter(bookSlug, chapterSlug)
  if (!post) notFound()

  const allChapters = getBookNoteChapters(bookSlug)
  const currentIdx = allChapters.findIndex((c) => c.slug === chapterSlug)
  const prev = currentIdx > 0 ? allChapters[currentIdx - 1] : null
  const next = currentIdx < allChapters.length - 1 ? allChapters[currentIdx + 1] : null
  const tocChapters = extractChapters(post.content)
  const sources = extractLinks(post.content)
  const bookHref = `/notes/${encodeURIComponent(bookSlug)}`

  return (
    <>
      <ReadingProgress />
      <div className={styles.container}>
        <main className={styles.wrapper}>
          <article className={styles.article}>
            <header className={styles.header}>
              <div className={styles.titleRow}>
                <h1>{post.title}</h1>
              </div>
            </header>
            {tocChapters.length > 0 && (
              <details className={styles.mobileToc}>
                <summary className={styles.mobileTocSummary}>
                  Contents ({tocChapters.length})
                </summary>
                <ul className={styles.mobileTocList}>
                  {tocChapters.map((c) => (
                    <li key={c.id}>
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
                  href={`/notes/${encodeURIComponent(bookSlug)}/${encodeURIComponent(prev.slug)}`}
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
                  href={`/notes/${encodeURIComponent(bookSlug)}/${encodeURIComponent(next.slug)}`}
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
            bookSlug={bookSlug}
            bookHref={bookHref}
            chapters={tocChapters}
            newWords={post.newWords}
            sources={sources.length > 0 ? sources : undefined}
          />
        </main>
      </div>
      <Footer />
    </>
  )
}
