import {
  getAllBlogPosts,
  getBlogPost,
  getAllCreations,
  getCreation,
  getBookNoteChapters,
  getBookChapter,
} from "./content"
import { postPath, NOTE_LABELS } from "./url"

// Server-only: builds the flat record set shipped to the browser at /search-index.json.

export type SearchRecord = {
  id: string
  type: "blog" | "note" | "chapter" | "creation"
  title: string
  parentTitle?: string
  description: string
  body: string
  tags: string[]
  label?: string
  lang?: string
  translationKey?: string
  url: string
  cover?: string
}

const MAX_BODY = 2000

/** Strip Markdown/MDX down to plain searchable text. */
export const stripToText = (md: string): string =>
  md
    .replace(/```[\s\S]*?```/g, " ") // fenced code
    .replace(/`[^`]*`/g, " ") // inline code
    .replace(/!\[\[[^\]]*\]\]/g, " ") // obsidian embeds
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ") // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // links → text
    .replace(/<[^>]+>/g, " ") // html/mdx tags
    .replace(/^\s{0,3}#{1,6}\s+/gm, "") // heading markers
    .replace(/[*_~>`|#-]+/g, " ") // emphasis / table / blockquote noise
    .replace(/\$\$?[^$]*\$\$?/g, " ") // math
    .replace(/\s+/g, " ")
    .trim()

const isNote = (label?: string) =>
  !!label && (NOTE_LABELS as readonly string[]).includes(label)

export const buildSearchRecords = (): SearchRecord[] => {
  const records: SearchRecord[] = []

  for (const meta of getAllBlogPosts()) {
    const post = getBlogPost(meta.slug)
    if (!post) continue
    const note = isNote(post.label)
    records.push({
      id: `${note ? "note" : "blog"}:${post.slug}`,
      type: note ? "note" : "blog",
      title: post.title,
      description: post.description,
      body: stripToText(post.content).slice(0, MAX_BODY),
      tags: post.tags,
      label: post.label,
      lang: post.lang,
      translationKey: post.translationKey,
      url: postPath(post.slug, post.label),
      cover: post.cover,
    })

    // Book/lesson note chapters become their own results.
    if (note) {
      for (const ch of getBookNoteChapters(post.slug)) {
        const chapter = getBookChapter(post.slug, ch.slug)
        if (!chapter) continue
        records.push({
          id: `chapter:${post.slug}:${ch.slug}`,
          type: "chapter",
          title: chapter.title,
          parentTitle: post.title,
          description: "",
          body: stripToText(chapter.content).slice(0, MAX_BODY),
          tags: chapter.tags,
          url: `/notes/${encodeURIComponent(post.slug)}/${encodeURIComponent(ch.slug)}`,
        })
      }
    }
  }

  for (const meta of getAllCreations()) {
    const creation = getCreation(meta.slug)
    if (!creation) continue
    records.push({
      id: `creation:${creation.slug}`,
      type: "creation",
      title: creation.title,
      description: creation.description,
      body: stripToText(creation.content).slice(0, MAX_BODY),
      tags: creation.tags,
      url: `/creations/${encodeURIComponent(creation.slug)}`,
      cover: creation.cover,
    })
  }

  return records
}
