import type { Metadata } from "next"
import type { BlogMeta, CreationMeta } from "./content"
import { absoluteUrl, AUTHOR, SITE_NAME, SITE_URL, SITE_DESC, DEFAULT_OG_IMAGE } from "./site"
import { coverUrl, postPath } from "./url"

/** hreflang map for a translation group, for `alternates.languages`. */
export const hreflangMap = (
  siblings: BlogMeta[],
): Record<string, string> | undefined => {
  const entries = siblings
    .filter((s) => s.lang)
    .map((s) => [s.lang as string, absoluteUrl(postPath(s.slug, s.label))] as const)
  return entries.length ? Object.fromEntries(entries) : undefined
}

type Shareable = BlogMeta | CreationMeta

/**
 * Build OpenGraph + Twitter metadata for a content page.
 *
 * Image strategy: when the post has a cover we surface it as the share image.
 * When it doesn't, we omit `images` so the route inherits the branded root
 * `opengraph-image` card (this also dodges the CJK/Cyrillic font problem that
 * would come from rendering arbitrary titles inside ImageResponse).
 */
export const buildPostMetadata = (
  post: Shareable,
  pathPrefix: "blog" | "notes" | "creations",
  languages?: Record<string, string>,
): Metadata => {
  const url = absoluteUrl(`/${pathPrefix}/${post.slug}`)
  // Always set images explicitly: cover when present, branded card otherwise.
  // Metadata merges shallowly, so a child openGraph fully replaces the root's —
  // never rely on inheriting the default image.
  const images = [post.cover ? absoluteUrl(coverUrl(post.cover)) : DEFAULT_OG_IMAGE]

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: url, ...(languages ? { languages } : {}) },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url,
      siteName: SITE_NAME,
      publishedTime: post.publishedAt,
      tags: post.tags,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images,
    },
  }
}

/** Static OpenGraph block for non-dynamic pages (about, blog index, etc.). */
export const buildPageMetadata = (
  title: string,
  description: string,
  path: string,
): Metadata => {
  const url = absoluteUrl(path)
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      title,
      description,
      url,
      siteName: SITE_NAME,
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: { card: "summary_large_image", title, description, images: [DEFAULT_OG_IMAGE] },
  }
}

// ── JSON-LD structured data ──────────────────────────────────────────────────

/** schema.org BlogPosting for a content page. */
export const articleJsonLd = (
  post: BlogMeta,
  pathPrefix: "blog" | "notes",
): Record<string, unknown> => {
  const url = absoluteUrl(`/${pathPrefix}/${post.slug}`)
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: { "@type": "Person", name: AUTHOR.name, url: AUTHOR.url },
    ...(post.cover ? { image: absoluteUrl(coverUrl(post.cover)) } : {}),
    keywords: [post.label, ...post.tags].join(", "),
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
  }
}

/** schema.org WebSite + Person for the home page. */
export const siteJsonLd = (): Record<string, unknown> => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  description: SITE_DESC,
  url: SITE_URL,
  author: { "@type": "Person", name: AUTHOR.name, url: AUTHOR.url },
})
