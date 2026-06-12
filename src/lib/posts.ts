import fs from "fs"
import path from "path"
import matter from "gray-matter"

export const CDN = "https://d4frua9bq45mo.cloudfront.net"

export type PostMeta = {
  slug: string
  title: string
  description: string
  category: "project" | "lab"
  tags: string[]
  publishedAt: string
  mainVideo?: string
  demo?: string
  repo?: string
  draft?: boolean
}

export type Post = PostMeta & { content: string }

const POSTS_DIR = path.join(process.cwd(), "content", "posts")

export const videoUrl = (mainVideo: string): string => `${CDN}/${mainVideo}.mp4`

export const formatDate = (date: string): string =>
  new Date(date).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).replace(" ", ", ")

const toMeta = (slug: string, data: Record<string, unknown>): PostMeta => ({
  slug,
  title: String(data.title),
  description: String(data.description).trim(),
  category: data.category as PostMeta["category"],
  tags: (data.tags as string[]) ?? [],
  publishedAt: data.publishedAt instanceof Date
    ? data.publishedAt.toISOString()
    : String(data.publishedAt),
  mainVideo: data.mainVideo ? String(data.mainVideo) : undefined,
  demo: data.demo ? String(data.demo) : undefined,
  repo: data.repo ? String(data.repo) : undefined,
  draft: Boolean(data.draft),
})

export const getAllPosts = (): PostMeta[] =>
  fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => {
      const slug = f.replace(/\.mdx$/, "")
      const { data } = matter(fs.readFileSync(path.join(POSTS_DIR, f), "utf8"))
      return toMeta(slug, data)
    })
    .filter((p) => !p.draft)
    .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt))

export const getPost = (slug: string): Post | null => {
  const file = path.join(POSTS_DIR, `${slug}.mdx`)
  if (!fs.existsSync(file)) return null
  const { data, content } = matter(fs.readFileSync(file, "utf8"))
  return { ...toMeta(slug, data), content }
}

export const getFeaturedPosts = (): PostMeta[] => {
  const { featuredPosts } = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "content", "featured-posts.json"), "utf8"),
  ) as { featuredPosts: string[] }
  const all = getAllPosts()
  return featuredPosts
    .map((slug) => all.find((p) => p.slug === slug))
    .filter((p): p is PostMeta => Boolean(p))
}

export type TagCount = { tag: string; count: number }

export const getAllTags = (): TagCount[] => {
  const counts = new Map<string, number>()
  for (const post of getAllPosts()) {
    for (const tag of [post.category, ...post.tags]) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1)
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
}

export const getPostsByTag = (tag: string): PostMeta[] =>
  getAllPosts().filter((p) => p.category === tag || p.tags.includes(tag))
