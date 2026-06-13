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
import { formatDate, getAllBlogPosts, getBlogPost } from "@/lib/content"
import { ReadingProgress } from "@/components/ReadingProgress"

export const generateStaticParams = () =>
  getAllBlogPosts().map((p) => ({ slug: p.slug }))

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

const NOTE_LABELS = ["lesson-note", "note", "book-review"] as const

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
  const isNote = (NOTE_LABELS as readonly string[]).includes(post.label)

  return (
    <>
      <ReadingProgress />
      <div className={styles.container}>
        <main className={styles.wrapper}>
          <article className={styles.article}>
            <Link href={isNote ? "/notes" : "/blog"} className={styles.back}>
              ← {isNote ? "Notes" : "Blog"}
            </Link>
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
            {post.cover && (
              <div className={styles.coverWrapper}>
                <div className={styles.lightBorder}>
                  <Image
                    src={post.cover}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 800px"
                    className={styles.coverImage}
                    priority
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
                    <li key={c.id}>
                      <a href={`#${c.id}`}>{c.title}</a>
                    </li>
                  ))}
                </ul>
              </details>
            )}
            <div className="post-content">
              <MDXRemote
                source={post.content}
                components={mdxComponents}
                options={{
                  blockJS: false,
                  blockDangerousJS: false,
                  mdxOptions: { useDynamicImport: true },
                }}
              />
            </div>
          </article>
          <Chapters chapters={chapters} />
        </main>
      </div>
      <Footer />
    </>
  )
}
