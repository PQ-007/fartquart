import type { Metadata } from "next"
import { Footer } from "@/components/Footer"
import { BlogListing } from "@/components/BlogListing"
import { getAllBlogPosts } from "@/lib/content"
import { buildPageMetadata } from "@/lib/seo"

export const metadata: Metadata = buildPageMetadata(
  "Blog",
  "Essays, project logs, internship notes, and writing.",
  "/blog",
)

export default function BlogPage() {
  const NOTE_LABELS = ["lesson-note", "book-note"]
  const posts = getAllBlogPosts().filter((p) => !NOTE_LABELS.includes(p.label))
  return (
    <>
      <BlogListing posts={posts} />
      <Footer gradient />
    </>
  )
}
