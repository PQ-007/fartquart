import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { MDXRemote } from "next-mdx-remote/rsc"
import styles from "./page.module.css"
import { Footer } from "@/components/Footer"
import { Tag } from "@/components/Tag"
import { Chapters, type Chapter } from "@/components/post/Chapters"
import { mdxComponents, slugify } from "@/components/post/mdx-components"
import { formatDate, getAllBlogPosts, getBlogPost, getBookNoteChapters } from "@/lib/content"
import { ReadingProgress } from "@/components/ReadingProgress"
import { mdxOptions, sanitizeMdx } from "@/lib/mdx-options"

const NOTE_LABELS = ["lesson-note", "book-note"] as const
const DIRECTORY_LABELS = ["book-note", "lesson-note"]

export const generateStaticParams = () =>
  getAllBlogPosts()
    .filter((p) => (NOTE_LABELS as readonly string[]).includes(p.label))
    .map((p) => ({ slug: p.slug }))

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> => {
  const { slug: encoded } = await params
  const slug = decodeURIComponent(encoded)
  const post = getBlogPost(slug)
  if (!post) return {}
  return { title: post.title, description: post.description }
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

const Stars = ({ rating }: { rating: number }) => {
  const full = Math.floor(rating)
  const half = rating - full >= 0.5 ? 1 : 0
  const empty = 5 - full - half
  return (
    <div className={styles.stars}>
      {Array.from({ length: full }).map((_, i) => <span key={`f${i}`} className={styles.starFull}>★</span>)}
      {half ? <span className={styles.starHalf}>★</span> : null}
      {Array.from({ length: empty }).map((_, i) => <span key={`e${i}`} className={styles.starEmpty}>★</span>)}
      <span className={styles.ratingNum}>{rating % 1 === 0 ? rating.toFixed(0) : rating.toFixed(1)}</span>
    </div>
  )
}

export default async function NoteSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug: encoded } = await params
  const slug = decodeURIComponent(encoded)
  const post = getBlogPost(slug)
  if (!post) notFound()

  const isBookNote = DIRECTORY_LABELS.includes(post.label)
  const bookChapters = isBookNote ? getBookNoteChapters(slug) : []
  const tocChapters = extractChapters(post.content)

  return (
    <>
      <ReadingProgress />
      <div className={styles.container}>
        <main className={styles.wrapper}>
          <article className={styles.article}>
            {isBookNote ? (
              <>
                <header className={styles.bookNoteHeader}>
                  <div className={styles.bookNoteTop}>
                    {post.cover && (
                      <div className={styles.bookNoteCover}>
                        <Image src={post.cover} alt={post.title} fill sizes="80px" style={{ objectFit: "cover" }} />
                      </div>
                    )}
                    <div className={styles.bookNoteInfo}>
                      <h1 className={styles.bookNoteTitle}>{post.title}</h1>
                      {post.author && <p className={styles.bookNoteAuthor}>{post.author}</p>}
                      {post.rating != null && <Stars rating={post.rating} />}
                      <div className={styles.bookNoteTags}>
                        <Tag name={post.label} />
                        {post.tags.map((tag) => (
                          <Tag key={tag} name={tag} href={`/tags/${encodeURIComponent(tag)}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                  {bookChapters.length > 0 && (
                    <nav className={styles.chapterList}>
                      <p className={styles.chapterListHeading}>Chapters</p>
                      {bookChapters.map((ch, i) => (
                        <Link
                          key={ch.slug}
                          href={`/notes/${encodeURIComponent(slug)}/${encodeURIComponent(ch.slug)}`}
                          className={styles.chapterItem}
                        >
                          <span className={styles.chapterNum}>{i + 1}</span>
                          <span className={styles.chapterTitle}>{ch.title}</span>
                        </Link>
                      ))}
                    </nav>
                  )}
                </header>
                {post.content.trim() && (
                  <div className="post-content">
                    <MDXRemote
                      source={sanitizeMdx(post.content)}
                      components={mdxComponents}
                      options={mdxOptions}
                    />
                  </div>
                )}
              </>
            ) : (
              <>
                <header className={styles.header}>
                  <div className={styles.titleRow}>
                    <h1>{post.title}</h1>
                    <p className={styles.dateMeta}>
                      {formatDate(post.publishedAt)}
                      {post.readTime ? ` · ${post.readTime} min` : ""}
                    </p>
                  </div>
                  <div className={styles.tags}>
                    <Tag name={post.label} />
                    {post.tags.map((tag) => (
                      <Tag key={tag} name={tag} href={`/tags/${encodeURIComponent(tag)}`} />
                    ))}
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
              </>
            )}
          </article>
          {!isBookNote && <Chapters chapters={tocChapters} />}
        </main>
      </div>
      <Footer />
    </>
  )
}
