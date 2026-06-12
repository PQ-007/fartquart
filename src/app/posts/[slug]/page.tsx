import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { MDXRemote } from "next-mdx-remote/rsc"
import styles from "./page.module.css"
import { Footer } from "@/components/Footer"
import { Tag } from "@/components/Tag"
import { VideoPlayer } from "@/components/VideoPlayer"
import { Chapters, type Chapter } from "@/components/post/Chapters"
import { mdxComponents, slugify } from "@/components/post/mdx-components"
import { formatDate, getAllPosts, getPost, videoUrl } from "@/lib/posts"

export const generateStaticParams = () =>
  getAllPosts().map((post) => ({ slug: post.slug }))

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> => {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) return {}
  return {
    title: `${post.title} | Josh Warren`,
    description: post.description,
  }
}

const extractChapters = (content: string): Chapter[] => {
  const chapters: Chapter[] = []
  let inCode = false
  for (const line of content.split("\n")) {
    if (line.trim().startsWith("```")) inCode = !inCode
    if (inCode) continue
    const match = /^##\s+(.+)$/.exec(line)
    if (match) {
      const title = match[1].trim()
      chapters.push({ id: slugify(title), title })
    }
  }
  return chapters
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = getPost(slug)
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
                {post.tags.map((tag) => (
                  <Tag key={tag} name={tag} href={`/tags/${encodeURIComponent(tag)}`} />
                ))}
              </div>
            </header>
            <div className={styles.videoWrapper}>
              <div className={styles.lightBorder}>
                <VideoPlayer src={videoUrl(post.mainVideo)} />
              </div>
            </div>
            <div className="post-content">
              <MDXRemote
                source={post.content}
                components={mdxComponents}
                options={{
                  // local trusted content: keep JSX expression attributes
                  // and `export const` statements used by Sandpack embeds
                  blockJS: false,
                  blockDangerousJS: false,
                  mdxOptions: { useDynamicImport: true },
                }}
              />
            </div>
          </article>
          <Chapters chapters={chapters} demo={post.demo} repo={post.repo} />
        </main>
      </div>
      <Footer />
    </>
  )
}
