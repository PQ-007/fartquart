import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { defaultLocale } from "./i18n"
import { localizePost, collapseTranslations } from "./translations"
export { formatDate } from "./format"
export type { CreationCategory } from "./categories"
import type { CreationCategory } from "./categories"

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
const PROJECT_NOTES_DIR = contentDir("project-notes")

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
  createdAt?: string
  publishedAt: string
  updatedAt?: string
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
  category?: CreationCategory
  projectNickname?: string
}

export type Blog = BlogMeta & { content: string }

export type CreationMeta = {
  slug: string
  title: string
  description: string
  tags: string[]
  createdAt?: string
  publishedAt: string
  updatedAt?: string
  cover?: string
  demo?: string
  repo?: string
  youtube?: string
  draft?: boolean
  category?: CreationCategory
}

export type Creation = CreationMeta & { content: string }

export type TagCount = { tag: string; count: number }

export type GraphNode = {
  id: string
  type: "tag" | "blog" | "note" | "chapter" | "creation" | "hub"
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
  createdAt: data.createdAt ? normalizeDate(data.createdAt) : undefined,
  publishedAt: normalizeDate(data.publishedAt ?? data.date ?? data.createdAt ?? new Date()),
  updatedAt: data.updatedAt ? normalizeDate(data.updatedAt) : undefined,
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
  category: data.category ? (String(data.category) as BlogMeta["category"]) : undefined,
  projectNickname: data["project-nickname"]
    ? String(data["project-nickname"])
    : data.projectNickname
      ? String(data.projectNickname)
      : undefined,
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
  createdAt: data.createdAt ? normalizeDate(data.createdAt) : undefined,
  publishedAt: normalizeDate(data.publishedAt ?? data.date ?? data.createdAt ?? new Date()),
  updatedAt: data.updatedAt ? normalizeDate(data.updatedAt) : undefined,
  cover: data.cover ? String(data.cover) : undefined,
  demo: data.demo ? String(data.demo) : undefined,
  repo: data.repo ? String(data.repo) : undefined,
  youtube: data.youtube ? String(data.youtube) : undefined,
  draft: Boolean(data.draft),
  category: data.category ? (String(data.category) as CreationMeta["category"]) : undefined,
})

/** A creation's own `category`, falling back to its attached project-log's `category`. */
const creationCategoryOf = (c: CreationMeta): CreationMeta["category"] =>
  c.category ?? getProjectLog(c.slug)?.category

export const getAllCreations = (): CreationMeta[] =>
  readDir(CREATIONS_DIR)
    .map((f) => {
      const slug = fileToSlug(f)
      const { data } = matter(fs.readFileSync(path.join(CREATIONS_DIR, f), "utf8"))
      return toCreationMeta(slug, data)
    })
    .filter((c) => !c.draft)
    .map((c) => ({ ...c, category: creationCategoryOf(c) }))
    .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt))

export const getCreation = (slug: string): Creation | null => {
  for (const ext of [".md", ".mdx"]) {
    const file = path.join(CREATIONS_DIR, `${slug}${ext}`)
    if (fs.existsSync(file)) {
      const { data, content } = matter(fs.readFileSync(file, "utf8"))
      const meta = toCreationMeta(slug, data)
      return { ...meta, category: creationCategoryOf(meta), content }
    }
  }
  return null
}

export const getCreationsByTag = (tag: string): CreationMeta[] =>
  getAllCreations().filter((c) => creationTagsOf(c).includes(tag))

// ── Project logs ─────────────────────────────────────────────────────────────
// A project-log is a chaptered folder (index.md + entry files) that attaches to
// a creation via a `project-nickname` field matching the creation's slug —
// it lives outside ALL_BLOG_DIRS so it never appears on /blog directly.

const findProjectLogDir = (creationSlug: string): string | null => {
  if (!fs.existsSync(PROJECT_NOTES_DIR)) return null
  const dirs = fs
    .readdirSync(PROJECT_NOTES_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory())
  for (const d of dirs) {
    const indexFile = path.join(PROJECT_NOTES_DIR, d.name, "index.md")
    if (!fs.existsSync(indexFile)) continue
    const { data } = matter(fs.readFileSync(indexFile, "utf8"))
    const nickname = data["project-nickname"] ?? data.projectNickname
    if (nickname && String(nickname) === creationSlug) {
      return path.join(PROJECT_NOTES_DIR, d.name)
    }
  }
  return null
}

export const getProjectLog = (creationSlug: string): Blog | null => {
  const dir = findProjectLogDir(creationSlug)
  if (!dir) return null
  const { data, content } = matter(fs.readFileSync(path.join(dir, "index.md"), "utf8"))
  if (data.draft) return null
  return { ...toBlogMeta(path.basename(dir), data, content), content }
}

export const getProjectLogChapters = (creationSlug: string): { slug: string; title: string }[] => {
  const dir = findProjectLogDir(creationSlug)
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

export const getProjectLogChapter = (creationSlug: string, chapterSlug: string): Blog | null => {
  const dir = findProjectLogDir(creationSlug)
  if (!dir) return null
  const file = path.join(dir, `${chapterSlug}.md`)
  if (!fs.existsSync(file)) return null
  const { data, content } = matter(fs.readFileSync(file, "utf8"))
  return { ...toBlogMeta(chapterSlug, data, content), content }
}

/** A creation's own tags plus its attached project-log's tags, if any. */
const creationTagsOf = (c: CreationMeta): string[] => {
  const log = getProjectLog(c.slug)
  return [...new Set([...c.tags, ...(log?.tags ?? [])])]
}

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
    for (const tag of creationTagsOf(creation)) {
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

// ── Graph data for the Obsidian-style node graph ───────────────────────────
// Mirrors Obsidian's graph view: notes connect to each other via `[[wikilinks]]`
// in their bodies, to their tags, and chaptered notes cluster around their
// index. Hub nodes anchor the three site sections.

const NOTE_LABELS: readonly string[] = ["book-note", "lesson-note"]

// Obsidian resolves `[[target]]` by file basename regardless of folder;
// `[[target|alias]]` and `[[target#heading]]` still point at `target`.
const WIKILINK_RE = /(?<!!)\[\[([^\]]+)\]\]/g
const MEDIA_EXT_RE = /\.(png|jpe?g|gif|webp|avif|svg|mp4|webm|mov|mp3|wav|pdf|excalidraw)$/i

const extractWikilinkTargets = (content: string): string[] => {
  const targets: string[] = []
  for (const [, inner] of content.matchAll(WIKILINK_RE)) {
    const target = inner.split("|")[0].split("#")[0].trim()
    if (!target || MEDIA_EXT_RE.test(target)) continue
    const basename = target.split("/").pop()!.trim().toLowerCase()
    if (basename) targets.push(basename)
  }
  return targets
}

export const getGraphData = (locale: string = defaultLocale): GraphData => {
  const blogs = collapseTranslations(getAllBlogPosts(), locale)
  const creations = getAllCreations()

  const nodes: GraphNode[] = [
    { id: "hub:blog", type: "hub", label: "Blog", href: "/blog" },
    { id: "hub:notes", type: "hub", label: "Notes", href: "/notes" },
    { id: "hub:creations", type: "hub", label: "Creations", href: "/creations" },
  ]
  const edges: GraphEdge[] = []
  // file basename (lowercased) → node id, for wikilink resolution
  const byBasename = new Map<string, string>()
  // node id → wikilink targets found in its body
  const outLinks = new Map<string, string[]>()
  const tagSet = new Set<string>()
  // chapter tag links are added only for tags that already exist on
  // posts/creations, so every tag node's /tags page is non-empty
  const pendingTagEdges: { source: string; tag: string }[] = []

  const addNote = (
    id: string,
    type: GraphNode["type"],
    label: string,
    href: string,
    basename: string,
    content: string | undefined,
  ) => {
    nodes.push({ id, type, label, href })
    byBasename.set(basename.toLowerCase(), id)
    if (content) outLinks.set(id, extractWikilinkTargets(content))
  }

  for (const p of blogs) {
    const isNote = NOTE_LABELS.includes(p.label)
    const id = `${isNote ? "note" : "blog"}:${p.slug}`
    const href = `${isNote ? "/notes" : "/blog"}/${encodeURIComponent(p.slug)}`
    addNote(id, isNote ? "note" : "blog", p.title, href, p.slug, getBlogPost(p.slug)?.content)
    edges.push({ source: isNote ? "hub:notes" : "hub:blog", target: id })
    for (const t of [p.label, ...p.tags]) {
      tagSet.add(t)
      edges.push({ source: id, target: `tag:${t}` })
    }

    if (!isNote) continue
    for (const ch of getBookNoteChapters(p.slug)) {
      const chapter = getBookChapter(p.slug, ch.slug)
      const chId = `chapter:${p.slug}/${ch.slug}`
      addNote(
        chId,
        "chapter",
        ch.title,
        `/notes/${encodeURIComponent(p.slug)}/${encodeURIComponent(ch.slug)}`,
        ch.slug,
        chapter?.content,
      )
      edges.push({ source: id, target: chId })
      for (const t of chapter?.tags ?? []) pendingTagEdges.push({ source: chId, tag: t })
    }
  }

  for (const c of creations) {
    const id = `creation:${c.slug}`
    const log = getProjectLog(c.slug)
    // the project log's index renders on the creation page, so its links count
    // as the creation's
    const content = [getCreation(c.slug)?.content, log?.content].filter(Boolean).join("\n")
    addNote(id, "creation", c.title, `/creations/${encodeURIComponent(c.slug)}`, c.slug, content)
    edges.push({ source: "hub:creations", target: id })
    for (const t of creationTagsOf(c)) {
      tagSet.add(t)
      edges.push({ source: id, target: `tag:${t}` })
    }

    for (const ch of getProjectLogChapters(c.slug)) {
      const chapter = getProjectLogChapter(c.slug, ch.slug)
      const chId = `chapter:${c.slug}/${ch.slug}`
      addNote(
        chId,
        "chapter",
        ch.title,
        `/creations/${encodeURIComponent(c.slug)}/log/${encodeURIComponent(ch.slug)}`,
        ch.slug,
        chapter?.content,
      )
      edges.push({ source: id, target: chId })
      for (const t of chapter?.tags ?? []) pendingTagEdges.push({ source: chId, tag: t })
    }
  }

  for (const tag of tagSet) {
    nodes.push({
      id: `tag:${tag}`,
      type: "tag",
      label: tag,
      href: `/tags/${encodeURIComponent(tag)}`,
    })
  }
  for (const { source, tag } of pendingTagEdges) {
    if (tagSet.has(tag)) edges.push({ source, target: `tag:${tag}` })
  }

  for (const [source, targets] of outLinks) {
    for (const basename of targets) {
      const target = byBasename.get(basename)
      if (target && target !== source) edges.push({ source, target })
    }
  }

  // Dedupe (the graph is undirected — a↔b duplicates collapse) and drop edges
  // to nodes that don't exist (unresolved wikilinks, filtered tags).
  const ids = new Set(nodes.map((n) => n.id))
  const seen = new Set<string>()
  const uniqueEdges = edges.filter((e) => {
    if (!ids.has(e.source) || !ids.has(e.target)) return false
    const key = e.source < e.target ? `${e.source} ${e.target}` : `${e.target} ${e.source}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  return { nodes, edges: uniqueEdges }
}
