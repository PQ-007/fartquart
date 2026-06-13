import type { Metadata } from "next"
import { Footer } from "@/components/Footer"
import { BlogListing } from "@/components/BlogListing"
import { getAllBlogPosts } from "@/lib/content"

export const metadata: Metadata = { title: "Blog" }

export default function BlogPage() {
  const NOTE_LABELS = ["note", "lesson-note", "book-note"]
  const posts = getAllBlogPosts().filter((p) => !NOTE_LABELS.includes(p.label))
  return (
    <>
      <BlogListing posts={posts} />
      <Footer gradient />
    </>
  )
}
