import MiniSearch, { type SearchResult } from "minisearch"
import type { SearchRecord } from "./search-index"
import { defaultLocale } from "./i18n"

// Client-side full-text search. The only seam: swap getIndex()/searchPosts for a
// server query if the corpus ever outgrows a browser-shipped index.

// ── Tokenizer ────────────────────────────────────────────────────────────────
// Intl.Segmenter word-segmentation handles Japanese (no spaces) and Mongolian/
// Latin alike; the same function tokenizes both documents and queries.
const segmenter =
  typeof Intl !== "undefined" && "Segmenter" in Intl
    ? new Intl.Segmenter(undefined, { granularity: "word" })
    : null

const tokenize = (text: string): string[] => {
  if (!segmenter) return text.split(/[\s\p{P}\p{S}]+/u).filter(Boolean)
  const out: string[] = []
  for (const seg of segmenter.segment(text)) {
    if (seg.isWordLike) out.push(seg.segment)
  }
  return out
}

const processTerm = (term: string): string | null => {
  const t = term.toLowerCase().normalize("NFKC")
  return t.length > 0 ? t : null
}

// ── Index (lazy, module-cached) ──────────────────────────────────────────────
type Hit = SearchResult & SearchRecord

let indexPromise: Promise<MiniSearch<SearchRecord>> | null = null

const buildIndex = async (): Promise<MiniSearch<SearchRecord>> => {
  const res = await fetch("/search-index.json")
  const records = (await res.json()) as SearchRecord[]
  const mini = new MiniSearch<SearchRecord>({
    fields: ["title", "description", "body", "tags"],
    storeFields: [
      "type",
      "title",
      "parentTitle",
      "description",
      "body",
      "tags",
      "label",
      "lang",
      "translationKey",
      "url",
      "cover",
    ],
    tokenize,
    processTerm,
    searchOptions: {
      boost: { title: 3, tags: 2, description: 1.5 },
      fuzzy: 0.2,
      prefix: true,
    },
  })
  mini.addAll(records)
  return mini
}

export const getIndex = (): Promise<MiniSearch<SearchRecord>> =>
  (indexPromise ??= buildIndex())

// ── Locale collapsing ────────────────────────────────────────────────────────
// A translated post may match in several languages; show it once, preferring the
// reader's language, else the top-ranked matched variant.
const collapse = (results: Hit[], locale: string): Hit[] => {
  const groups = new Map<string, Hit[]>()
  for (const r of results) {
    if (r.translationKey) {
      const list = groups.get(r.translationKey)
      if (list) list.push(r)
      else groups.set(r.translationKey, [r])
    }
  }
  const seen = new Set<string>()
  const out: Hit[] = []
  for (const r of results) {
    if (!r.translationKey) {
      out.push(r)
      continue
    }
    if (seen.has(r.translationKey)) continue
    seen.add(r.translationKey)
    const variants = groups.get(r.translationKey)!
    out.push(
      variants.find((v) => v.lang === locale) ??
        variants.find((v) => v.lang === defaultLocale) ??
        variants[0],
    )
  }
  return out
}

// ── Snippet ──────────────────────────────────────────────────────────────────
const makeSnippet = (body: string, terms: string[], radius = 70): string => {
  if (!body) return ""
  const lower = body.toLowerCase()
  let at = -1
  for (const term of terms) {
    const i = lower.indexOf(term.toLowerCase())
    if (i !== -1 && (at === -1 || i < at)) at = i
  }
  if (at === -1) return body.slice(0, radius * 2).trim() + (body.length > radius * 2 ? "…" : "")
  const start = Math.max(0, at - radius)
  const end = Math.min(body.length, at + radius)
  return `${start > 0 ? "…" : ""}${body.slice(start, end).trim()}${end < body.length ? "…" : ""}`
}

export type SearchHit = {
  record: SearchRecord
  snippet: string
  terms: string[]
}

export const searchPosts = async (
  query: string,
  locale: string,
  limit = 20,
): Promise<SearchHit[]> => {
  const q = query.trim()
  if (!q) return []
  const index = await getIndex()
  const results = index.search(q) as Hit[]
  return collapse(results, locale)
    .slice(0, limit)
    .map((r) => ({
      record: {
        id: r.id as string,
        type: r.type,
        title: r.title,
        parentTitle: r.parentTitle,
        description: r.description,
        body: r.body,
        tags: r.tags,
        label: r.label,
        lang: r.lang,
        translationKey: r.translationKey,
        url: r.url,
        cover: r.cover,
      },
      snippet: makeSnippet(r.body, r.terms),
      terms: r.terms,
    }))
}
