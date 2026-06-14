import { getAllBlogPosts } from "@/lib/content"
import { SITE_URL, SITE_NAME, SITE_DESC } from "@/lib/site"
import { postPath } from "@/lib/url"

const SITE_TITLE = SITE_NAME
const SITE_DESCRIPTION = SITE_DESC

function escape(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

export async function GET() {
  const posts = getAllBlogPosts().slice(0, 20)

  const items = posts
    .map((p) => {
      const url = `${SITE_URL}${postPath(p.slug, p.label)}`
      const date = new Date(p.publishedAt).toUTCString()
      return `    <item>
      <title>${escape(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escape(p.description)}</description>
      <pubDate>${date}</pubDate>
    </item>`
    })
    .join("\n")

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(SITE_TITLE)}</title>
    <link>${SITE_URL}</link>
    <description>${escape(SITE_DESCRIPTION)}</description>
    <language>en</language>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  })
}
