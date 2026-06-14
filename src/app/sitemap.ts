import type { MetadataRoute } from "next"
import {
  getAllBlogPosts,
  getAllCreations,
  getBookNoteChapters,
  getAllTagsUnified,
} from "@/lib/content"
import { SITE_URL } from "@/lib/site"
import { postPath, NOTE_LABELS } from "@/lib/url"

export default function sitemap(): MetadataRoute.Sitemap {
  const abs = (p: string) => `${SITE_URL}${p}`
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: abs("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: abs("/blog"), lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: abs("/notes"), lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: abs("/creations"), lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: abs("/about"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: abs("/tags"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ]

  const posts = getAllBlogPosts()

  const postRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
    url: abs(postPath(p.slug, p.label)),
    lastModified: new Date(p.publishedAt),
    changeFrequency: "monthly",
    priority: 0.7,
  }))

  const chapterRoutes: MetadataRoute.Sitemap = posts
    .filter((p) => (NOTE_LABELS as readonly string[]).includes(p.label))
    .flatMap((p) =>
      getBookNoteChapters(p.slug).map((ch) => ({
        url: abs(`/notes/${encodeURIComponent(p.slug)}/${encodeURIComponent(ch.slug)}`),
        lastModified: new Date(p.publishedAt),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
    )

  const creationRoutes: MetadataRoute.Sitemap = getAllCreations().map((c) => ({
    url: abs(`/creations/${encodeURIComponent(c.slug)}`),
    lastModified: new Date(c.publishedAt),
    changeFrequency: "monthly",
    priority: 0.7,
  }))

  const tagRoutes: MetadataRoute.Sitemap = getAllTagsUnified().map(({ tag }) => ({
    url: abs(`/tags/${encodeURIComponent(tag)}`),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.4,
  }))

  return [
    ...staticRoutes,
    ...postRoutes,
    ...chapterRoutes,
    ...creationRoutes,
    ...tagRoutes,
  ]
}
