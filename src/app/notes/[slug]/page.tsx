import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { MDXRemote } from "next-mdx-remote/rsc"
import styles from "./page.module.css"
import { Footer } from "@/components/Footer"
import { Tag } from "@/components/Tag"
import { Chapters } from "@/components/post/Chapters"
import { mdxComponents } from "@/components/post/mdx-components"
import { extractChapters } from "@/lib/toc"
import { formatDate, getAllBlogPosts, getBlogPost, getBookNoteChapters, getRelatedPosts, getTranslationSiblings } from "@/lib/content"
import { RelatedPosts } from "@/components/RelatedPosts"
import { JsonLd } from "@/components/JsonLd"
import { MusicPlayer } from "@/components/MusicPlayer"
import { TranslationSwitcher } from "@/components/TranslationSwitcher"
import { mdxOptions, sanitizeMdx } from "@/lib/mdx-options"
import { coverUrl, isGif } from "@/lib/url"
import { buildPostMetadata, articleJsonLd, hreflangMap } from "@/lib/seo"

const NOTE_LABELS = ["lesson-note", "book-note"] as const

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
  return buildPostMetadata(post, "notes", hreflangMap(getTranslationSiblings(slug)))
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

  const isLessonNote = post.label === "lesson-note"
  const isBookNote = post.label === "book-note"
  const chapters = (isLessonNote || isBookNote) ? getBookNoteChapters(slug) : []
  const tocChapters = extractChapters(post.content)
  const related = getRelatedPosts(slug)
  const siblings = getTranslationSiblings(slug)

  return (
    <>
      <JsonLd data={articleJsonLd(post, "notes")} />
      {post.music && <MusicPlayer src={post.music} />}
      <div className={styles.container}>
        <main className={styles.wrapper}>
          <article className={styles.article}>
            {siblings.length > 0 && (isLessonNote || isBookNote) && (
              <div style={{ marginBottom: 20 }}>
                <TranslationSwitcher siblings={siblings} currentSlug={slug} />
              </div>
            )}

            {isLessonNote ? (
              <>
                <div className={styles.lessonCover}>
                  {post.cover ? (
                    <Image
                      src={coverUrl(post.cover)}
                      alt={post.title}
                      fill
                      sizes="(max-width: 900px) 100vw, 800px"
                      style={{ objectFit: "cover" }}
                      unoptimized={isGif(post.cover)}
                    />
                  ) : (
                    <div
                      className={styles.lessonPlaceholder}
                      style={{ background: gradientFor(slug) }}
                    />
                  )}
                </div>
                <header className={styles.lessonHeader}>
                  <div className={styles.lessonMeta}>
                    <Tag name={post.label} />
                    <span className={styles.dateMeta}>{formatDate(post.publishedAt)}</span>
                  </div>
                  <h1 className={styles.lessonTitle}>{post.title}</h1>
                  {post.description && (
                    <p className={styles.lessonDescription}>{post.description}</p>
                  )}
                </header>
                {chapters.length > 0 && (
                  <nav className={styles.lessonList}>
                    <p className={styles.lessonListHeading}>Lessons</p>
                    {chapters.map((ch, i) => (
                      <Link
                        key={ch.slug}
                        href={`/notes/${encodeURIComponent(slug)}/${encodeURIComponent(ch.slug)}`}
                        className={styles.lessonItem}
                      >
                        <span className={styles.lessonNum}>{String(i + 1).padStart(2, "0")}</span>
                        <span className={styles.lessonItemTitle}>{ch.title}</span>
                      </Link>
                    ))}
                  </nav>
                )}
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
            ) : isBookNote ? (
              <>
                <header className={styles.bookNoteHeader}>
                  <div className={styles.bookNoteTop}>
                    {post.cover && (
                      <div className={styles.bookNoteCover}>
                        <Image src={coverUrl(post.cover)} alt={post.title} fill sizes="80px" style={{ objectFit: "cover" }} unoptimized={isGif(post.cover)} />
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
                  {chapters.length > 0 && (
                    <nav className={styles.chapterList}>
                      <p className={styles.chapterListHeading}>Chapters</p>
                      {chapters.map((ch, i) => (
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
              </>
            )}

          </article>
          {!isLessonNote && !isBookNote && (
            <Chapters chapters={tocChapters} siblings={siblings} currentSlug={slug} />
          )}
        </main>
      </div>
      <RelatedPosts posts={related} />
      <Footer />
    </>
  )
}
