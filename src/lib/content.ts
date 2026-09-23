import fs from "fs"
import path from "path"
import { cache } from "react"
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
  /** Looping MP4 the post page plays in place of `cover`, which is its poster. */
  coverVideo?: string
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
  /** Held at the top of the home feed, above the latest posts. */
  pinned?: boolean
  category?: CreationCategory
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
  coverVideo?: string
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
  /** ISO publish date — only set for doc nodes (blog/note/chapter/creation), used by the graph's timeline playback. */
  date?: string
}

export type GraphEdge = { source: string; target: string }

export type GraphData = { nodes: GraphNode[]; edges: GraphEdge[] }

// ── Helpers ────────────────────────────────────────────────────────────────

// The vault ships inside the deployment, so parsed content is immutable for the
// life of a production process — memoize every fs walk for the process lifetime
// (this spans all pages of a `next build`, where the walkers are hottest). In
// dev, React's cache() only dedupes within one render pass, so vault edits
// still show up on the next refresh.
const memo = <A extends unknown[], R>(fn: (...args: A) => R): ((...args: A) => R) => {
  if (process.env.NODE_ENV !== "production") return cache(fn)
  const store = new Map<string, R>()
  return (...args: A) => {
    const key = JSON.stringify(args)
    if (!store.has(key)) store.set(key, fn(...args))
    return store.get(key) as R
  }
}

const normalizeDate = (raw: unknown): string => {
  if (raw instanceof Date) return raw.toISOString()
  return String(raw)
}

// A YAML list left as `tags:\n  - ` parses to `[null]`, and a bare `tags:` to
// `null` — the templates ship that way, so coerce and drop the blanks here.
const normalizeTags = (raw: unknown): string[] =>
  Array.isArray(raw)
    ? raw
        .filter((t): t is string | number => t != null && t !== "")
        .map((t) => String(t).trim())
        .filter((t) => t.length > 0)
    : []

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
  tags: normalizeTags(data.tags),
  createdAt: data.createdAt ? normalizeDate(data.createdAt) : undefined,
  publishedAt: normalizeDate(data.publishedAt ?? data.date ?? data.createdAt ?? new Date()),
  updatedAt: data.updatedAt ? normalizeDate(data.updatedAt) : undefined,
  cover: data.cover ? String(data.cover) : undefined,
  coverVideo: data.coverVideo ? String(data.coverVideo) : undefined,
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
  pinned: Boolean(data.pinned),
  category: data.category ? (String(data.category) as BlogMeta["category"]) : undefined,
})

export const getAllBlogPosts = memo((): BlogMeta[] =>
  ALL_BLOG_DIRS.flatMap((dir) =>
    readDir(dir).map((f) => {
      const slug = fileToSlug(f)
      const { data, content } = matter(fs.readFileSync(path.join(dir, f), "utf8"))
      return toBlogMeta(slug, data, content)
    })
  )
  .filter((p) => !p.draft)
  .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt)))

export const getBlogPost = memo((slug: string): Blog | null => {
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
})

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

export const getBookNoteChapters = memo((bookSlug: string): { slug: string; title: string }[] => {
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
})

export const getBookChapter = memo((bookSlug: string, chapterSlug: string): Blog | null => {
  const dir = findNoteDir(bookSlug)
  if (!dir) return null
  const file = path.join(dir, `${chapterSlug}.md`)
  if (!fs.existsSync(file)) return null
  const { data, content } = matter(fs.readFileSync(file, "utf8"))
  return { ...toBlogMeta(chapterSlug, data, content), content }
})

// ── Creations ──────────────────────────────────────────────────────────────

const toCreationMeta = (slug: string, data: Record<string, unknown>): CreationMeta => ({
  slug,
  title: String(data.title ?? ""),
  description: String(data.description ?? "").trim(),
  tags: normalizeTags(data.tags),
  createdAt: data.createdAt ? normalizeDate(data.createdAt) : undefined,
  publishedAt: normalizeDate(data.publishedAt ?? data.date ?? data.createdAt ?? new Date()),
  updatedAt: data.updatedAt ? normalizeDate(data.updatedAt) : undefined,
  cover: data.cover ? String(data.cover) : undefined,
  coverVideo: data.coverVideo ? String(data.coverVideo) : undefined,
  demo: data.demo ? String(data.demo) : undefined,
  repo: data.repo ? String(data.repo) : undefined,
  youtube: data.youtube ? String(data.youtube) : undefined,
  draft: Boolean(data.draft),
  category: data.category ? (String(data.category) as CreationMeta["category"]) : undefined,
})

export const getAllCreations = memo((): CreationMeta[] =>
  readDir(CREATIONS_DIR)
    .map((f) => {
      const slug = fileToSlug(f)
      const { data } = matter(fs.readFileSync(path.join(CREATIONS_DIR, f), "utf8"))
      return toCreationMeta(slug, data)
    })
    .filter((c) => !c.draft)
    .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt)))

export const getCreation = memo((slug: string): Creation | null => {
  for (const ext of [".md", ".mdx"]) {
    const file = path.join(CREATIONS_DIR, `${slug}${ext}`)
    if (fs.existsSync(file)) {
      const { data, content } = matter(fs.readFileSync(file, "utf8"))
      return { ...toCreationMeta(slug, data), content }
    }
  }
  return null
})

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

// ── Vault link graph (wikilinks) ─────────────────────────────────────────────
// One walk over every published document powers the Obsidian-style graph,
// in-content wikilink rendering, and per-page backlinks.

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

type VaultDoc = {
  id: string
  type: GraphNode["type"]
  title: string
  href: string
  basename: string
  tags: string[]
  hub?: string
  parentId?: string
  content: string
  publishedAt: string
}

/**
 * Every published document as a flat list: blog posts, note indexes, their
 * chapters, and creations.
 * `collapse` picks one language variant per translation group.
 */
const getVaultDocs = memo((locale: string = defaultLocale, collapse = true): VaultDoc[] => {
  const all = getAllBlogPosts()
  const blogs = collapse ? collapseTranslations(all, locale) : all
  const docs: VaultDoc[] = []

  for (const p of blogs) {
    const isNote = NOTE_LABELS.includes(p.label)
    const id = `${isNote ? "note" : "blog"}:${p.slug}`
    docs.push({
      id,
      type: isNote ? "note" : "blog",
      title: p.title,
      href: `${isNote ? "/notes" : "/blog"}/${encodeURIComponent(p.slug)}`,
      basename: p.slug,
      tags: [p.label, ...p.tags],
      hub: isNote ? "hub:notes" : "hub:blog",
      content: getBlogPost(p.slug)?.content ?? "",
      publishedAt: p.publishedAt,
    })
    if (!isNote) continue
    for (const ch of getBookNoteChapters(p.slug)) {
      const chapter = getBookChapter(p.slug, ch.slug)
      docs.push({
        id: `chapter:${p.slug}/${ch.slug}`,
        type: "chapter",
        title: ch.title,
        href: `/notes/${encodeURIComponent(p.slug)}/${encodeURIComponent(ch.slug)}`,
        basename: ch.slug,
        tags: chapter?.tags ?? [],
        parentId: id,
        content: chapter?.content ?? "",
        publishedAt: chapter?.publishedAt ?? p.publishedAt,
      })
    }
  }

  for (const c of getAllCreations()) {
    docs.push({
      id: `creation:${c.slug}`,
      type: "creation",
      title: c.title,
      href: `/creations/${encodeURIComponent(c.slug)}`,
      basename: c.slug,
      tags: c.tags,
      hub: "hub:creations",
      content: getCreation(c.slug)?.content ?? "",
      publishedAt: c.publishedAt,
    })
  }

  return docs
})

/** File basename (lowercased) → link target, for rendering `[[wikilinks]]`. */
export const getWikilinkIndex = memo((): Map<string, { href: string; title: string }> => {
  const map = new Map<string, { href: string; title: string }>()
  for (const d of getVaultDocs(defaultLocale, false)) {
    map.set(d.basename.toLowerCase(), { href: d.href, title: d.title })
  }
  return map
})

export type Backlink = { title: string; href: string; type: GraphNode["type"] }

/**
 * Documents whose body wikilinks point at `basename` (a page's own slug /
 * chapter slug) — Obsidian's "linked mentions".
 */
export const getBacklinks = memo((basename: string): Backlink[] => {
  const target = basename.trim().toLowerCase()
  return getVaultDocs(defaultLocale, false)
    .filter(
      (d) =>
        d.basename.toLowerCase() !== target &&
        extractWikilinkTargets(d.content).includes(target),
    )
    .map((d) => ({ title: d.title, href: d.href, type: d.type }))
})

// ── Graph data for the Obsidian-style node graph ───────────────────────────
// Mirrors Obsidian's graph view: notes connect to each other via `[[wikilinks]]`
// in their bodies, to their tags, and chaptered notes cluster around their
// index. Hub nodes anchor the three site sections.

export const getGraphData = memo((locale: string = defaultLocale): GraphData => {
  const docs = getVaultDocs(locale)

  const nodes: GraphNode[] = [
    { id: "hub:blog", type: "hub", label: "Blog", href: "/blog" },
    { id: "hub:notes", type: "hub", label: "Notes", href: "/notes" },
    { id: "hub:creations", type: "hub", label: "Creations", href: "/creations" },
    ...docs.map((d) => ({ id: d.id, type: d.type, label: d.title, href: d.href, date: d.publishedAt })),
  ]
  const edges: GraphEdge[] = []
  const byBasename = new Map(docs.map((d) => [d.basename.toLowerCase(), d.id]))
  const tagSet = new Set<string>()
  // chapter tag links are added only for tags that already exist on
  // posts/creations, so every tag node's /tags page is non-empty
  const pendingTagEdges: { source: string; tag: string }[] = []

  for (const d of docs) {
    if (d.hub) edges.push({ source: d.hub, target: d.id })
    if (d.parentId) edges.push({ source: d.parentId, target: d.id })
    for (const t of d.tags) {
      if (d.type === "chapter") {
        pendingTagEdges.push({ source: d.id, tag: t })
      } else {
        tagSet.add(t)
        edges.push({ source: d.id, target: `tag:${t}` })
      }
    }
    for (const basename of extractWikilinkTargets(d.content)) {
      const target = byBasename.get(basename)
      if (target && target !== d.id) edges.push({ source: d.id, target })
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
})

// ── Local graph (per-page neighborhood) ──────────────────────────────────────

/** Graph node ids as `getVaultDocs` assigns them, for pages to locate themselves. */
export const vaultNodeId = {
  post: (p: BlogMeta): string =>
    `${NOTE_LABELS.includes(p.label) ? "note" : "blog"}:${p.slug}`,
  creation: (slug: string): string => `creation:${slug}`,
  chapter: (parentSlug: string, chapterSlug: string): string =>
    `chapter:${parentSlug}/${chapterSlug}`,
}

/**
 * Obsidian-style local graph: `id`, its direct neighbors (via wikilinks, tags,
 * and chapter structure), and every edge among them. Hub nodes are dropped —
 * they'd sit at the center of every local graph and say nothing.
 */
export const getLocalGraph = memo((id: string): GraphData => {
  const { nodes, edges } = getGraphData()
  const keep = new Set([id])
  for (const e of edges) {
    if (e.source === id) keep.add(e.target)
    else if (e.target === id) keep.add(e.source)
  }
  const localNodes = nodes.filter((n) => keep.has(n.id) && n.type !== "hub")
  const ids = new Set(localNodes.map((n) => n.id))
  return {
    nodes: localNodes,
    edges: edges.filter((e) => ids.has(e.source) && ids.has(e.target)),
  }
})

// ── Vault file tree (Obsidian-style explorer sidebar) ───────────────────────
// Mirrors the site's own three sections rather than the raw content/ folder
// names — a reader-facing tree, not a filesystem listing. Chapters nest under
// their book/lesson-note index or their creation's project log.

export type VaultTreeNode = {
  id: string
  title: string
  href: string
  type: GraphNode["type"]
  children?: VaultTreeNode[]
}

export type VaultTreeGroup = {
  id: string
  label: string
  href: string
  children: VaultTreeNode[]
}

export const getVaultTree = memo((locale: string = defaultLocale): VaultTreeGroup[] => {
  const docs = getVaultDocs(locale)
  const byParent = new Map<string, VaultDoc[]>()
  for (const d of docs) {
    if (!d.parentId) continue
    if (!byParent.has(d.parentId)) byParent.set(d.parentId, [])
    byParent.get(d.parentId)!.push(d)
  }
  const toNode = (d: VaultDoc): VaultTreeNode => {
    const kids = byParent.get(d.id)
    return {
      id: d.id,
      title: d.title,
      href: d.href,
      type: d.type,
      children: kids?.map(toNode),
    }
  }
  const group = (id: string, label: string, href: string): VaultTreeGroup => ({
    id,
    label,
    href,
    children: docs.filter((d) => d.hub === id).map(toNode),
  })
  return [
    group("hub:blog", "Blog", "/blog"),
    group("hub:notes", "Notes", "/notes"),
    group("hub:creations", "Creations", "/creations"),
  ]
})
