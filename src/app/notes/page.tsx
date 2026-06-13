import type { Metadata } from "next"
import { Footer } from "@/components/Footer"
import { NotesListing } from "@/components/NotesListing"
import { getAllBlogPosts } from "@/lib/content"

export const metadata: Metadata = { title: "Notes" }

export default function NotesPage() {
  const posts = getAllBlogPosts().filter(
    (p) => p.label === "lesson-note" || p.label === "note" || p.label === "book-note",
  )
  return (
    <>
      <NotesListing posts={posts} />
      <Footer gradient />
    </>
  )
}
