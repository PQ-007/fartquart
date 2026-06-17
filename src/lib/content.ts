import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { defaultLocale } from "./i18n"
import { localizePost, collapseTranslations } from "./translations"
export { formatDate } from "./format"

const CONTENT_DIR = path.join(process.cwd(), "content")

// Resolve a content category folder by name, tolerating an optional ordering
// prefix like "000-" / "002_" (so "blog" matches "000-blog"). Falls back to the
// bare name if nothing matches.
const contentDir = (name: string): string => {
  try {
    const match = fs
      .readdirSync(CONTENT_DIR, { withFileTypes: true })
      .find(
        (e) =>
          e.isDirectory() &&
          (e.name === name || e.name.replace(/^\d+[-_]/, "") === name),
      )
    if (match) return path.join(CONTENT_DIR, match.name)
  } catch {
    // content dir missing — fall through
  }
  return path.join(CONTENT_DIR, name)
}

const BLOG_DIR = contentDir("blog")
const BOOK_NOTES_DIR = contentDir("book-notes")
const LESSON_NOTES_DIR = contentDir("lesson-notes")
const ALL_BLOG_DIRS = [BLOG_DIR, BOOK_NOTES_DIR, LESSON_NOTES_DIR]
const CREATIONS_DIR = contentDir("creations")

// ── Types ──────────────────────────────────────────────────────────────────

export type BlogLabel =
  | "book-review"
  | "book-note"
  | "internship"
  | "project-log"
  | "contest"
  | "essay"
  | "article"
  | "lesson-note"

export type NewWord = { word: string; definition?: string }

export type BlogMeta = {
  slug: string
  title: string
  description: string
  label: BlogLabel
  tags: string[]
  publishedAt: string
  cover?: string
  author?: string
  rating?: number
  pages?: number
  genre?: string
  readTime?: number
  newWords?: NewWord[]
  music?: string
  lang?: string
  translationKey?: string
  draft?: boolean
}

export type Blog = BlogMeta & { content: string }

export type CreationMeta = {
  slug: string
  title: string
  description: string
  tags: string[]
  publishedAt: string
  cover?: string
  demo?: string
  repo?: string
  youtube?: string
  draft?: boolean
}

export type Creation = CreationMeta & { content: string }

export type TagCount = { tag: string; count: number }

export type GraphNode = {
  id: string
  type: "tag" | "blog" | "creation" | "hub"
  label: string
  href: string
}

export type GraphEdge = { source: string; target: string }

export type GraphData = { nodes: GraphNode[]; edges: GraphEdge[] }

// ── Helpers ────────────────────────────────────────────────────────────────


const normalizeDate = (raw: unknown): string => {
  if (raw instanceof Date) return raw.toISOString()
  return String(raw)
}

const readDir = (dir: string): string[] => {
  if (!fs.existsSync(dir)) return []
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const flat = entries
    .filter((e) => e.isFile() && (e.name.endsWith(".md") || e.name.endsWith(".mdx")))
    .map((e) => e.name)
  const folderIndexes = entries
    .filter((e) => e.isDirectory() && fs.existsSync(path.join(dir, e.name, "index.md")))
    .map((e) => `${e.name}/index.md`)
  return [...flat, ...folderIndexes]
}

const fileToSlug = (f: string) =>
  f.includes("/") ? f.split("/")[0] : f.replace(/\.(md|mdx)$/, "")

// ── Blog ───────────────────────────────────────────────────────────────────

const parseNewWords = (raw: unknown): NewWord[] | undefined => {
  if (!Array.isArray(raw) || raw.length === 0) return undefined
  const words = raw
    .map((item) => {
      if (typeof item === "string") {
        const colon = item.indexOf(":")
        if (colon > 0) {
          return { word: item.slice(0, colon).trim(), definition: item.slice(colon + 1).trim() }
        }
        return { word: item.trim() }
      }
      const obj = item as Record<string, unknown>
      return {
        word: String(obj.word ?? "").trim(),
        definition: obj.definition ? String(obj.definition).trim() : undefined,
      }
    })
    // Drop blank entries (e.g. the empty new-word block left in a template).
    .filter((w) => w.word.length > 0)
  return words.length > 0 ? words : undefined
}

export const estimateReadTime = (content: string): number =>
  Math.max(1, Math.round(content.trim().split(/\s+/).length / 200))

const toBlogMeta = (slug: string, data: Record<string, unknown>, content = ""): BlogMeta => ({
  slug,
  title: String(data.title ?? ""),
  description: String(data.description ?? "").trim(),
  label: (data.label as BlogLabel) ?? "article",
  tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
  publishedAt: normalizeDate(data.date ?? data.publishedAt ?? new Date()),
  cover: data.cover ? String(data.cover) : undefined,
  author: data.author ? String(data.author) : undefined,
  rating: data.rating != null ? Number(data.rating) : undefined,
  pages: data.pages ? Number(data.pages) : undefined,
  genre: data.genre ? String(data.genre) : undefined,
  readTime: content ? estimateReadTime(content) : undefined,
  newWords: parseNewWords(data["new-word"]),
  music: data.music ? String(data.music) : undefined,
  lang: data.lang ? String(data.lang) : undefined,
  translationKey: data["translation-key"]
    ? String(data["translation-key"])
    : data.translationKey
      ? String(data.translationKey)
      : undefined,
  draft: Boolean(data.draft),
})

export const getAllBlogPosts = (): BlogMeta[] =>
  ALL_BLOG_DIRS.flatMap((dir) =>
    readDir(dir).map((f) => {
      const slug = fileToSlug(f)
      const { data, content } = matter(fs.readFileSync(path.join(dir, f), "utf8"))
      return toBlogMeta(slug, data, content)
    })
  )
  .filter((p) => !p.draft)
  .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt))

export const getBlogPost = (slug: string): Blog | null => {
  for (const dir of ALL_BLOG_DIRS) {
    for (const ext of [".md", ".mdx"]) {
      const file = path.join(dir, `${slug}${ext}`)
      if (fs.existsSync(file)) {
        const { data, content } = matter(fs.readFileSync(file, "utf8"))
        return { ...toBlogMeta(slug, data, content), content }
      }
    }
    const indexFile = path.join(dir, slug, "index.md")
    if (fs.existsSync(indexFile)) {
      const { data, content } = matter(fs.readFileSync(indexFile, "utf8"))
      return { ...toBlogMeta(slug, data, content), content }
    }
  }
  return null
}

export const getBlogPostsByTag = (tag: string): BlogMeta[] =>
  getAllBlogPosts().filter((p) => p.label === tag || p.tags.includes(tag))

/**
 * All language variants of a post (including itself), grouped by `translationKey`.
 * Returns [] when the post has no translations.
 */
export const getTranslationSiblings = (slug: string): BlogMeta[] => {
  const all = getAllBlogPosts()
  const post = all.find((p) => p.slug === slug)
  if (!post?.translationKey) return []
  const group = all.filter((p) => p.translationKey === post.translationKey)
  return group.length > 1 ? group : []
}

/**
 * Posts most related to `slug`, ranked by shared tags (label counts as a tag),
 * tie-broken by recency. Excludes the post itself and its other-language variants.
 */
export const getRelatedPosts = (slug: string, limit = 3): BlogMeta[] => {
  const all = getAllBlogPosts()
  const current = all.find((p) => p.slug === slug)
  if (!current) return []
  const currentTags = new Set([current.label, ...current.tags])

  return all
    .filter(
      (p) =>
        p.slug !== slug &&
        !(current.translationKey && p.translationKey === current.translationKey),
    )
    .map((p) => ({
      post: p,
      score: [p.label, ...p.tags].filter((t) => currentTags.has(t)).length,
    }))
    .filter((x) => x.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        +new Date(b.post.publishedAt) - +new Date(a.post.publishedAt),
    )
    .slice(0, limit)
    .map((x) => x.post)
}

const NOTE_DIRS = [BOOK_NOTES_DIR, LESSON_NOTES_DIR]

const findNoteDir = (bookSlug: string): string | null => {
  for (const base of NOTE_DIRS) {
    const dir = path.join(base, bookSlug)
    if (fs.existsSync(dir)) return dir
  }
  return null
}

export const getBookNoteChapters = (bookSlug: string): { slug: string; title: string }[] => {
  const dir = findNoteDir(bookSlug)
  if (!dir) return []
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md") && f !== "index.md")
    .sort()
    .flatMap((f) => {
      const chSlug = f.replace(/\.md$/, "")
      const { data } = matter(fs.readFileSync(path.join(dir, f), "utf8"))
      if (data.draft) return []
      return [{ slug: chSlug, title: String(data.title ?? chSlug) }]
    })
}

export const getBookChapter = (bookSlug: string, chapterSlug: string): Blog | null => {
  const dir = findNoteDir(bookSlug)
  if (!dir) return null
  const file = path.join(dir, `${chapterSlug}.md`)
  if (!fs.existsSync(file)) return null
  const { data, content } = matter(fs.readFileSync(file, "utf8"))
  return { ...toBlogMeta(chapterSlug, data, content), content }
}

// ── Creations ──────────────────────────────────────────────────────────────

const toCreationMeta = (slug: string, data: Record<string, unknown>): CreationMeta => ({
  slug,
  title: String(data.title ?? ""),
  description: String(data.description ?? "").trim(),
  tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
  publishedAt: normalizeDate(data.date ?? data.publishedAt ?? new Date()),
  cover: data.cover ? String(data.cover) : undefined,
  demo: data.demo ? String(data.demo) : undefined,
  repo: data.repo ? String(data.repo) : undefined,
  youtube: data.youtube ? String(data.youtube) : undefined,
  draft: Boolean(data.draft),
})

export const getAllCreations = (): CreationMeta[] =>
  readDir(CREATIONS_DIR)
    .map((f) => {
      const slug = fileToSlug(f)
      const { data } = matter(fs.readFileSync(path.join(CREATIONS_DIR, f), "utf8"))
      return toCreationMeta(slug, data)
    })
    .filter((c) => !c.draft)
    .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt))

export const getCreation = (slug: string): Creation | null => {
  for (const ext of [".md", ".mdx"]) {
    const file = path.join(CREATIONS_DIR, `${slug}${ext}`)
    if (fs.existsSync(file)) {
      const { data, content } = matter(fs.readFileSync(file, "utf8"))
      return { ...toCreationMeta(slug, data), content }
    }
  }
  return null
}

export const getCreationsByTag = (tag: string): CreationMeta[] =>
  getAllCreations().filter((c) => c.tags.includes(tag))

// ── Featured ───────────────────────────────────────────────────────────────

export const getFeaturedContent = (
  locale: string = defaultLocale,
): {
  blogs: BlogMeta[]
  creations: CreationMeta[]
} => {
  const featuredFile = path.join(process.cwd(), "content", "featured.json")
  if (!fs.existsSync(featuredFile)) return { blogs: [], creations: [] }

  const { blogs: blogSlugs = [], creations: creationSlugs = [] } = JSON.parse(
    fs.readFileSync(featuredFile, "utf8"),
  ) as { blogs: string[]; creations: string[] }

  const allBlogs = getAllBlogPosts()
  const allCreations = getAllCreations()

  return {
    // A featured slug may point at any language variant — show the one matching
    // the active locale (falls back to original/default).
    blogs: blogSlugs
      .map((s) => allBlogs.find((p) => p.slug === s))
      .filter((p): p is BlogMeta => Boolean(p))
      .map((p) => localizePost(p, allBlogs, locale)),
    creations: creationSlugs
      .map((s) => allCreations.find((c) => c.slug === s))
      .filter((c): c is CreationMeta => Boolean(c)),
  }
}

// ── Tags ───────────────────────────────────────────────────────────────────

export const getAllBlogTags = (): TagCount[] => {
  const counts = new Map<string, number>()
  for (const post of getAllBlogPosts()) {
    for (const tag of [post.label, ...post.tags]) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1)
    }
  }
  return [...counts.entries()].map(([tag, count]) => ({ tag, count }))
}

export const getAllCreationTags = (): TagCount[] => {
  const counts = new Map<string, number>()
  for (const creation of getAllCreations()) {
    for (const tag of creation.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1)
    }
  }
  return [...counts.entries()].map(([tag, count]) => ({ tag, count }))
}

export const getAllTagsUnified = (): TagCount[] => {
  const counts = new Map<string, number>()
  for (const { tag, count } of [...getAllBlogTags(), ...getAllCreationTags()]) {
    counts.set(tag, (counts.get(tag) ?? 0) + count)
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
}

// ── Graph data for /tags Obsidian-style node graph ─────────────────────────

export const getGraphData = (locale: string = defaultLocale): GraphData => {
  const blogs = collapseTranslations(getAllBlogPosts(), locale)
  const creations = getAllCreations()

  const tagSet = new Set<string>()
  for (const p of blogs) {
    for (const t of [p.label, ...p.tags]) tagSet.add(t)
  }
  for (const c of creations) {
    for (const t of c.tags) tagSet.add(t)
  }

  const nodes: GraphNode[] = [
    ...[...tagSet].map((tag) => ({
      id: `tag:${tag}`,
      type: "tag" as const,
      label: tag,
      href: `/tags/${encodeURIComponent(tag)}`,
    })),
    ...blogs.map((p) => ({
      id: `blog:${p.slug}`,
      type: "blog" as const,
      label: p.title,
      href: `/blog/${p.slug}`,
    })),
    ...creations.map((c) => ({
      id: `creation:${c.slug}`,
      type: "creation" as const,
      label: c.title,
      href: `/creations/${c.slug}`,
    })),
  ]

  const edges: GraphEdge[] = [
    ...blogs.flatMap((p) =>
      [p.label, ...p.tags].map((tag) => ({
        source: `blog:${p.slug}`,
        target: `tag:${tag}`,
      })),
    ),
    ...creations.flatMap((c) =>
      c.tags.map((tag) => ({
        source: `creation:${c.slug}`,
        target: `tag:${tag}`,
      })),
    ),
  ]

  const hubNodes: GraphNode[] = [
    { id: "hub:blog", type: "hub", label: "Blog", href: "/blog" },
    { id: "hub:creations", type: "hub", label: "Creations", href: "/creations" },
  ]

  const hubEdges: GraphEdge[] = [
    ...blogs.map((p) => ({ source: "hub:blog", target: `blog:${p.slug}` })),
    ...creations.map((c) => ({ source: "hub:creations", target: `creation:${c.slug}` })),
  ]

  return { nodes: [...hubNodes, ...nodes], edges: [...edges, ...hubEdges] }
}
