import Image from "next/image"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { MDXRemote } from "next-mdx-remote/rsc"
import styles from "./page.module.css"
import { Footer } from "@/components/Footer"
import { Tag } from "@/components/Tag"
import { Chapters } from "@/components/post/Chapters"
import { mdxComponents } from "@/components/post/mdx-components"
import { extractChapters } from "@/lib/toc"
import { formatDate, getAllBlogPosts, getBlogPost, getRelatedPosts, getTranslationSiblings } from "@/lib/content"
import { RelatedPosts } from "@/components/RelatedPosts"
import { JsonLd } from "@/components/JsonLd"
import { MusicPlayer } from "@/components/MusicPlayer"
import { mdxOptions, sanitizeMdx } from "@/lib/mdx-options"
import { coverUrl, isGif } from "@/lib/url"
import { buildPostMetadata, articleJsonLd, hreflangMap } from "@/lib/seo"

const BLOG_LABELS = ["internship", "project-log", "contest", "essay", "book-review"] as const

export const generateStaticParams = () =>
  getAllBlogPosts()
    .filter((p) => (BLOG_LABELS as readonly string[]).includes(p.label))
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
  return buildPostMetadata(post, "blog", hreflangMap(getTranslationSiblings(slug)))
}

const Stars = ({ rating }: { rating: number }) => {
  const full = Math.floor(rating)
  const half = rating - full >= 0.5 ? 1 : 0
  const empty = 5 - full - half
  return (
    <div className={styles.bookStars}>
      {Array.from({ length: full }).map((_, i) => <span key={`f${i}`} className={styles.starFull}>★</span>)}
      {half ? <span className={styles.starHalf}>★</span> : null}
      {Array.from({ length: empty }).map((_, i) => <span key={`e${i}`} className={styles.starEmpty}>★</span>)}
      <span className={styles.ratingNum}>{rating % 1 === 0 ? rating.toFixed(0) : rating.toFixed(1)}</span>
    </div>
  )
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug: encoded } = await params
  const slug = decodeURIComponent(encoded)
  const post = getBlogPost(slug)
  if (!post) notFound()

  const chapters = extractChapters(post.content)
  const isBookReview = post.label === "book-review"
  const related = getRelatedPosts(slug)
  const siblings = getTranslationSiblings(slug)

  return (
    <>
      <JsonLd data={articleJsonLd(post, "blog")} />
      {post.music && <MusicPlayer src={post.music} />}
      <div className={styles.container}>
        <main className={styles.wrapper}>
          <article className={styles.article}>
            <header className={styles.header}>
              {isBookReview ? (
                <div className={styles.bookReviewHeader}>
                  <div className={styles.bookCover}>
                    {post.cover ? (
                      <Image
                        src={coverUrl(post.cover)}
                        alt={post.title}
                        fill
                        sizes="160px"
                        style={{ objectFit: "cover" }}
                        priority
                        unoptimized={isGif(post.cover)}
                      />
                    ) : (
                      <div className={styles.bookCoverPlaceholder} style={{ background: "#0f1f3d" }}>
                        <span>{post.title}</span>
                      </div>
                    )}
                  </div>
                  <div className={styles.bookInfo}>
                    <h1 className={styles.bookTitle}>{post.title}</h1>
                    {post.author && <p className={styles.bookAuthor}>{post.author}</p>}
                    {post.rating != null && <Stars rating={post.rating} />}
                    <div className={styles.bookMeta}>
                      {post.genre && <span className={styles.bookGenre}>{post.genre}</span>}
                      {post.pages && <span className={styles.bookPages}>{post.pages}p</span>}
                    </div>
                    <p className={styles.bookDate}>
                      {formatDate(post.publishedAt)}
                      {post.readTime ? ` · ${post.readTime} min read` : ""}
                    </p>
                    <div className={styles.tags}>
                      <Tag name={post.label} />
                      {post.tags.map((tag) => (
                        <Tag key={tag} name={tag} href={`/tags/${encodeURIComponent(tag)}`} />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <>
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
                </>
              )}
            </header>
            {!isBookReview && post.cover && (
              <div className={styles.coverWrapper}>
                <div className={styles.lightBorder}>
                  <Image
                    src={coverUrl(post.cover)}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 800px"
                    className={styles.coverImage}
                    priority
                    unoptimized={isGif(post.cover)}
                  />
                </div>
              </div>
            )}
            {chapters.length > 0 && (
              <details className={styles.mobileToc}>
                <summary className={styles.mobileTocSummary}>
                  Contents ({chapters.length})
                </summary>
                <ul className={styles.mobileTocList}>
                  {chapters.map((c) => (
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
          </article>
          <Chapters chapters={chapters} siblings={siblings} currentSlug={slug} />
        </main>
      </div>
      <RelatedPosts posts={related} />
      <Footer />
    </>
  )
}
