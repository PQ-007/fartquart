import type { Metadata } from "next"
import { Footer } from "@/components/Footer"
import { NotesListing } from "@/components/NotesListing"
import { getAllBlogPosts } from "@/lib/content"
import { buildPageMetadata } from "@/lib/seo"

export const metadata: Metadata = buildPageMetadata(
  "Notes",
  "Reading notes from books and lesson notes from courses.",
  "/notes",
)

export default function NotesPage() {
  const posts = getAllBlogPosts().filter(
    (p) => p.label === "lesson-note" || p.label === "book-note",
  )
  return (
    <>
      <NotesListing posts={posts} />
      <Footer gradient />
    </>
  )
}
