// Vault doctor — content lint for the Obsidian vault that ships with the site.
// Mirrors the publishing rules in src/lib/content.ts and reports what the site
// would silently degrade:
//
//   error    frontmatter that fails to parse, missing/empty title, invalid
//            date, or an `![[embed]]` that resolves to nothing (the embed is
//            dropped from the rendered page)
//   warning  missing description, missing date (publishedAt falls back to the
//            build timestamp, so the post re-dates itself every deploy),
//            `[[wikilinks]]` that render as plain text (target is a draft,
//            a private note, or doesn't exist), notes whose label doesn't
//            match their folder, and project logs whose `project-nickname`
//            matches no creation
//   info     orphaned notes (no wikilinks in or out) and untagged documents
//
// Exits 1 when any error is found (warnings/info never fail), so CI catches
// broken content before it deploys. Run via `npm run doctor`.

import fs from "node:fs"
import path from "node:path"
import matter from "gray-matter"

const root = process.cwd()
const CONTENT = path.join(root, "content")

// ── Same folder resolution as src/lib/content.ts ────────────────────────────

const contentDir = (name) => {
  try {
    const match = fs
      .readdirSync(CONTENT, { withFileTypes: true })
      .find(
        (e) =>
          e.isDirectory() &&
          (e.name === name || e.name.replace(/^\d+[-_]/, "") === name),
      )
    if (match) return path.join(CONTENT, match.name)
  } catch {
    // content dir missing — fall through
  }
  return path.join(CONTENT, name)
}

const BLOG_DIR = contentDir("blog")
const BOOK_NOTES_DIR = contentDir("book-notes")
const LESSON_NOTES_DIR = contentDir("lesson-notes")
const CREATIONS_DIR = contentDir("creations")
const PROJECT_NOTES_DIR = contentDir("project-notes")
const RESOURCES_DIR = contentDir("resources")

const WIKILINK_RE = /(?<!!)\[\[([^\]]+)\]\]/g
const EMBED_RE = /!\[\[([^\]]+)\]\]/g
const MEDIA_EXT_RE =
  /\.(png|jpe?g|gif|webp|avif|svg|mp4|webm|mov|m4v|mp3|wav|pdf|excalidraw)$/i

// ── Issue collection ────────────────────────────────────────────────────────

const issues = []
const report = (level, file, msg) =>
  issues.push({ level, file: path.relative(root, file), msg })

// Mirrors normalizeTags() in src/lib/content.ts. A YAML list left as
// `tags:\n  - ` parses to [null] and a bare `tags:` to null — the templates
// ship exactly that, and the site silently drops the blanks.
const listEntries = (raw) => (Array.isArray(raw) ? raw : [])
const isBlank = (v) => String(v ?? "").trim() === ""

const parseDoc = (file) => {
  try {
    return matter(fs.readFileSync(file, "utf8"))
  } catch (e) {
    report("error", file, `frontmatter failed to parse: ${String(e.message).split("\n")[0]}`)
    return null
  }
}

// ── Collect published documents (non-draft, mirroring content.ts) ───────────

// doc: { file, slug, kind: "post" | "creation" | "chapter", dir, data, content }
const docs = []

const collectFlatAndFolders = (dir, kind) => {
  if (!fs.existsSync(dir)) return
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isFile() && /\.(md|mdx)$/.test(e.name)) {
      const file = path.join(dir, e.name)
      const parsed = parseDoc(file)
      if (!parsed || parsed.data.draft) continue
      docs.push({ file, slug: e.name.replace(/\.(md|mdx)$/, ""), kind, dir, ...parsed })
    } else if (e.isDirectory()) {
      const indexFile = path.join(dir, e.name, "index.md")
      if (!fs.existsSync(indexFile)) continue
      const parsed = parseDoc(indexFile)
      if (!parsed || parsed.data.draft) continue
      docs.push({ file: indexFile, slug: e.name, kind, dir, ...parsed })
      collectChapters(path.join(dir, e.name))
    }
  }
}

const collectChapters = (folder) => {
  for (const f of fs.readdirSync(folder)) {
    if (!f.endsWith(".md") || f === "index.md") continue
    const file = path.join(folder, f)
    const parsed = parseDoc(file)
    if (!parsed || parsed.data.draft) continue
    docs.push({ file, slug: f.replace(/\.md$/, ""), kind: "chapter", dir: folder, ...parsed })
  }
}

collectFlatAndFolders(BLOG_DIR, "post")
collectFlatAndFolders(BOOK_NOTES_DIR, "post")
collectFlatAndFolders(LESSON_NOTES_DIR, "post")
collectFlatAndFolders(CREATIONS_DIR, "creation")

// Project logs publish only through the creation whose slug their
// `project-nickname` names; the log index's content merges into that page.
const creationSlugs = new Set(docs.filter((d) => d.kind === "creation").map((d) => d.slug))
if (fs.existsSync(PROJECT_NOTES_DIR)) {
  for (const e of fs.readdirSync(PROJECT_NOTES_DIR, { withFileTypes: true })) {
    if (!e.isDirectory()) continue
    const indexFile = path.join(PROJECT_NOTES_DIR, e.name, "index.md")
    if (!fs.existsSync(indexFile)) continue
    const parsed = parseDoc(indexFile)
    if (!parsed || parsed.data.draft) continue
    const nickname = parsed.data["project-nickname"] ?? parsed.data.projectNickname
    if (!nickname) {
      report("warn", indexFile, "project log has no project-nickname — it is never published")
      continue
    }
    if (!creationSlugs.has(String(nickname))) {
      report(
        "warn",
        indexFile,
        `project-nickname "${nickname}" matches no creation — the log is never published`,
      )
      continue
    }
    // The index body renders on the creation page; chapters get their own pages.
    docs.push({ file: indexFile, slug: `${e.name}#log-index`, kind: "log-index", dir: PROJECT_NOTES_DIR, ...parsed })
    collectChapters(path.join(PROJECT_NOTES_DIR, e.name))
  }
}

// ── Link targets ────────────────────────────────────────────────────────────

// Basenames the site can resolve (getWikilinkIndex over all published docs;
// log indexes are excluded — their basename never enters the index).
const publishedBasenames = new Set(
  docs.filter((d) => d.kind !== "log-index").map((d) => d.slug.toLowerCase()),
)

// Every markdown basename anywhere in the vault (drafts, private, templates,
// archive) — used to tell "links to something unpublished" from "typo".
const vaultBasenames = new Set()
const walkVault = (dir) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) {
      if (full === RESOURCES_DIR) continue
      walkVault(full)
    } else if (/\.(md|mdx)$/.test(e.name)) {
      vaultBasenames.add(e.name.replace(/\.(md|mdx)$/, "").toLowerCase())
    }
  }
}
walkVault(CONTENT)

// Embeds resolve like scripts/copy-resources.mjs: exact relative path first,
// then bare basename.
const resourceKeys = new Set()
if (fs.existsSync(RESOURCES_DIR)) {
  const walkResources = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name)
      if (e.isDirectory()) {
        walkResources(full)
        continue
      }
      resourceKeys.add(path.relative(RESOURCES_DIR, full).split(path.sep).join("/").toLowerCase())
      resourceKeys.add(e.name.toLowerCase())
    }
  }
  walkResources(RESOURCES_DIR)
}

// ── Per-document checks ─────────────────────────────────────────────────────

const linkTargetsOf = (content) => {
  const targets = []
  for (const [, inner] of content.matchAll(WIKILINK_RE)) {
    const target = inner.split("|")[0].split("#")[0].trim()
    if (!target || MEDIA_EXT_RE.test(target)) continue
    const basename = target.split("/").pop().trim().toLowerCase()
    if (basename) targets.push(basename)
  }
  return targets
}

const inbound = new Set()
const outboundResolved = new Map()

for (const doc of docs) {
  const { data, content, file, kind, slug } = doc

  // Frontmatter
  if (!String(data.title ?? "").trim()) {
    report("error", file, "missing title — the page renders with an empty heading")
  }
  if (kind !== "chapter" && kind !== "log-index" && !String(data.description ?? "").trim()) {
    report("warn", file, "missing description — card body and <meta description> are empty")
  }
  for (const [field, raw] of [
    ["tags", data.tags],
    ["new-word", data["new-word"]],
  ]) {
    const blanks = listEntries(raw).filter(isBlank).length
    if (blanks > 0) {
      report(
        "warn",
        file,
        `${blanks} blank ${blanks === 1 ? "entry" : "entries"} in ${field} — ` +
          `a bare "- " placeholder from the template; ` +
          `the site drops it, so fill it in or delete the line`,
      )
    }
  }
  const rawDate = data.publishedAt ?? data.date ?? data.createdAt
  if (kind === "post" || kind === "creation") {
    if (rawDate == null) {
      report("warn", file, "no date field — publishedAt falls back to the build timestamp and shifts every deploy")
    } else if (isNaN(+new Date(rawDate))) {
      report("error", file, `invalid date "${rawDate}"`)
    }
  }
  if (kind === "post") {
    const expected =
      doc.dir === BOOK_NOTES_DIR || path.dirname(doc.dir) === BOOK_NOTES_DIR
        ? "book-note"
        : doc.dir === LESSON_NOTES_DIR || path.dirname(doc.dir) === LESSON_NOTES_DIR
          ? "lesson-note"
          : null
    if (expected && data.label !== expected) {
      report(
        "warn",
        file,
        `label is "${data.label ?? "(none)"}" but the folder implies "${expected}" — it will render as a blog post, not a note`,
      )
    }
    // Blank entries don't count — `tags: [null]` reaches the site as no tags.
    if (listEntries(data.tags).every(isBlank)) {
      report("info", file, "no tags — the note won't connect to any tag in the graph")
    }
  }

  // Wikilinks
  let resolved = 0
  for (const basename of linkTargetsOf(content)) {
    if (publishedBasenames.has(basename)) {
      resolved++
      inbound.add(basename)
    } else if (vaultBasenames.has(basename)) {
      report("warn", file, `[[${basename}]] points at an unpublished note (draft/private) — renders as plain text`)
    } else {
      report("warn", file, `[[${basename}]] matches no note in the vault (typo?) — renders as plain text`)
    }
  }
  outboundResolved.set(slug.toLowerCase(), resolved)

  // Embeds
  for (const [, inner] of content.matchAll(EMBED_RE)) {
    const target = inner.split("|")[0].trim()
    const cleaned = target.toLowerCase()
    const hit = resourceKeys.has(cleaned) || resourceKeys.has(cleaned.split("/").pop())
    if (!hit) {
      report("error", file, `![[${target}]] not found in content/resources — the embed is dropped from the page`)
    }
  }
}

// Orphans — posts/creations with no resolved wikilinks in either direction
// (chapters are structurally linked to their index, so they're skipped).
for (const doc of docs) {
  if (doc.kind === "chapter" || doc.kind === "log-index") continue
  const slug = doc.slug.toLowerCase()
  if ((outboundResolved.get(slug) ?? 0) === 0 && !inbound.has(slug)) {
    report("info", doc.file, "orphan — no wikilinks in or out")
  }
}

// ── Output ──────────────────────────────────────────────────────────────────

const ORDER = { error: 0, warn: 1, info: 2 }
issues.sort((a, b) => ORDER[a.level] - ORDER[b.level] || a.file.localeCompare(b.file))

const isTTY = process.stdout.isTTY
const paint = (code, s) => (isTTY ? `\x1b[${code}m${s}\x1b[0m` : s)
const BADGE = {
  error: paint(31, "error"),
  warn: paint(33, " warn"),
  info: paint(36, " info"),
}

for (const { level, file, msg } of issues) {
  if (process.env.GITHUB_ACTIONS && level !== "info") {
    console.log(`::${level === "warn" ? "warning" : "error"} file=${file}::${msg}`)
  } else {
    console.log(`${BADGE[level]}  ${file}\n       ${msg}`)
  }
}

const count = (level) => issues.filter((i) => i.level === level).length
const errors = count("error")
console.log(
  `\n[vault-doctor] ${docs.length} published documents — ` +
    `${errors} error(s), ${count("warn")} warning(s), ${count("info")} info`,
)
process.exit(errors > 0 ? 1 : 0)
