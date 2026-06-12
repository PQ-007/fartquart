import Image from "next/image"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { MDXRemote } from "next-mdx-remote/rsc"
import styles from "./page.module.css"
import { Footer } from "@/components/Footer"
import { Tag } from "@/components/Tag"
import { Chapters, type Chapter } from "@/components/post/Chapters"
import { mdxComponents, slugify } from "@/components/post/mdx-components"
import { formatDate, getAllBlogPosts, getBlogPost } from "@/lib/content"

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
  let inCode = false
  for (const line of content.split("\n")) {
    if (line.trim().startsWith("```")) inCode = !inCode
    if (inCode) continue
    const match = /^##\s+(.+)$/.exec(line)
    if (match) chapters.push({ id: slugify(match[1].trim()), title: match[1].trim() })
  }
  return chapters
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

  return (
    <>
      <div className={styles.container}>
        <main className={styles.wrapper}>
          <article className={styles.article}>
            <header className={styles.header}>
              <div className={styles.titleRow}>
                <h1>{post.title}</h1>
                <p>{formatDate(post.publishedAt)}</p>
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
